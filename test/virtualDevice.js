'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert');

const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const MeteringCluster = require('../lib/clusters/metering');
const {
  createVirtualDevice,
  createSingleClusterDevice,
  frameToClient,
} = require('./util/virtualDevice');

const ON_OFF = OnOffCluster.ATTRIBUTES.onOff.id;
const ON_TIME = OnOffCluster.ATTRIBUTES.onTime.id;

describe('Virtual device', function () {
  it('answers a read and records both frames', async function () {
    const { zclNode, frames } = createVirtualDevice({
      endpoints: [
        { endpointId: 1, inputClusters: [OnOffCluster.ID], clusters: { onOff: { onOff: true } } },
      ],
    });

    const result = await zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.deepStrictEqual(result, { onOff: true });
    assert.deepStrictEqual(
      frames.map(({ from, frame }) => [from, frame.cmdId]),
      [
        ['zclNode', 0x00],
        ['virtualDevice', 0x01],
      ],
    );
  });

  it('lets attribute values be written', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        { endpointId: 1, inputClusters: [OnOffCluster.ID], clusters: { onOff: { onTime: 1 } } },
      ],
    });

    await zclNode.endpoints[1].clusters.onOff.writeAttributes({ onTime: 7 });

    assert.strictEqual(virtualDevice.endpoints[1].bindings.onOff.onTime, 7);
  });

  it('times out when an interceptor drops the response', async function (t) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const { zclNode, intercept, settle } = createVirtualDevice({
      endpoints: [
        { endpointId: 1, inputClusters: [OnOffCluster.ID], clusters: { onOff: { onOff: true } } },
      ],
    });
    intercept((frame) => (frame.from === 'virtualDevice' ? null : undefined));

    const read = zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);
    await settle();
    t.mock.timers.tick(10_000);

    await assert.rejects(read, /Timeout: Expected Response/);
  });

  it('rejects a frame longer than the Homey stack sends', async function () {
    const { zclNode } = createVirtualDevice({
      endpoints: [{ endpointId: 1, inputClusters: [OnOffCluster.ID] }],
      maxFrameSize: 2,
    });

    await assert.rejects(zclNode.endpoints[1].clusters.onOff.toggle(), /ZCL frame too long/);
  });

  it('fails settle when the nodes keep answering each other', async function () {
    const { zclNode, virtualDevice, settle } = createVirtualDevice({
      endpoints: [
        { endpointId: 1, inputClusters: [OnOffCluster.ID], outputClusters: [OnOffCluster.ID] },
      ],
    });
    // Each side answers a toggle with a toggle of its own. Not waiting for responses keeps no
    // response timers alive after the test.
    const NO_WAIT = { waitForResponse: false };
    const toggleBack = (node) =>
      new (class extends BoundCluster {
        toggle() {
          node.endpoints[1].clusters.onOff.toggle(undefined, NO_WAIT).catch(() => {});
        }
      })();
    virtualDevice.endpoints[1].bind('onOff', toggleBack(virtualDevice));
    zclNode.endpoints[1].bind('onOff', toggleBack(zclNode));

    zclNode.endpoints[1].clusters.onOff.toggle(undefined, NO_WAIT).catch(() => {});

    await assert.rejects(settle(), /are the nodes in a loop/);
  });
});

describe('Virtual device: known bugs on master', function () {
  it('readAttributes stops when the device answers with unrequested ids', async function () {
    // Whatever is asked, the plug answers with onTime only
    const { zclNode, intercept } = createSingleClusterDevice(
      OnOffCluster,
      new (class extends BoundCluster {
        async readAttributes() {
          const buf = Buffer.alloc(255);
          const records = [{ id: ON_TIME, status: 'SUCCESS', value: 5 }];
          const len = OnOffCluster.attributeArrayStatusDataType.toBuffer(buf, records, 0);
          return { attributes: buf.subarray(0, len) };
        }
      })(),
    );
    let reads = 0;
    intercept((frame) => {
      // Guard: on master the read loops forever.
      if (frame.from === 'zclNode' && ++reads > 3) throw new Error('read loop');
    });

    const result = await zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.strictEqual(reads, 1);
    assert.deepStrictEqual(result, {});
  });

  it('readAttributes([]) on metering splits the request to fit a frame', async function () {
    const { zclNode } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [MeteringCluster.ID],
          clusters: {
            metering: { currentSummationDelivered: 1234, multiplier: 1, divisor: 1000 },
          },
        },
      ],
    });

    // Every request must also fit the Homey stack, which the virtual link enforces.
    const { currentSummationDelivered, multiplier, divisor } =
      await zclNode.endpoints[1].clusters.metering.readAttributes([]);

    assert.deepStrictEqual(
      { currentSummationDelivered, multiplier, divisor },
      { currentSummationDelivered: 1234, multiplier: 1, divisor: 1000 },
    );
  });

  it(
    'Endpoint.unbind removes the binding, so the cluster is unsupported',
    { todo: 'unbind leaves a Cluster in bindings' },
    async function () {
      const { zclNode, virtualDevice } = createVirtualDevice({
        endpoints: [{ endpointId: 1, outputClusters: [OnOffCluster.ID] }],
      });
      zclNode.endpoints[1].bind('onOff', new BoundCluster());
      zclNode.endpoints[1].unbind('onOff');

      await assert.rejects(
        virtualDevice.endpoints[1].clusters.onOff.toggle(),
        /^Error: UNSUPPORTED_CLUSTER$/,
      );
    },
  );

  it(
    'a report with an unknown attribute id does not emit attr.undefined',
    { todo: 'onReportAttributes emits attr.undefined' },
    async function () {
      const { zclNode, virtualDevice, settle } = createVirtualDevice({
        endpoints: [{ endpointId: 1, inputClusters: [OnOffCluster.ID] }],
      });
      const onOff = zclNode.endpoints[1].clusters.onOff;
      const onUndefined = mock.fn();
      const onOnOff = mock.fn();
      onOff.on('attr.undefined', onUndefined);
      onOff.on('attr.onOff', onOnOff);

      const report = frameToClient({
        cmdId: 0x0a, // reportAttributes
        disableDefaultResponse: true,
        // 0x4242 uint8 (0x20) 1, then onOff bool (0x10) true
        data: Buffer.from([0x42, 0x42, 0x20, 0x01, ON_OFF, 0x00, 0x10, 0x01]),
      });
      await virtualDevice.sendFrame(1, OnOffCluster.ID, report);
      await settle();

      assert.deepStrictEqual(
        onOnOff.mock.calls.map((call) => call.arguments[0]),
        [true],
      );
      assert.strictEqual(onUndefined.mock.callCount(), 0);
    },
  );
});
