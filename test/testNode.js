'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert');

const { createVirtualDevice } = require('./util');
const BoundCluster = require('../lib/BoundCluster');
const Cluster = require('../lib/Cluster');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BasicCluster = require('../lib/clusters/basic');
const OnOffCluster = require('../lib/clusters/onOff');

// Cluster-specific, client to server, TSN 1, command 0x02 (toggle)
const TOGGLE = Buffer.from([0x01, 0x01, 0x02]);

/** A device with a basic cluster, served by `basic` when given. */
function basicDevice(basic) {
  return createVirtualDevice({
    endpoints: [
      { endpointId: 1, inputClusters: [BasicCluster.ID], clusters: basic ? { basic } : {} },
    ],
  });
}

/** A remote that sends onOff commands to the node under test, which serves them with `onOff`. */
function remoteSendingTo(onOff) {
  const virtual = createVirtualDevice({
    endpoints: [{ endpointId: 1, outputClusters: [OnOffCluster.ID] }],
  });
  virtual.zclNode.endpoints[1].bind('onOff', onOff);
  return virtual;
}

const summary = (frames) => frames.map(({ from, frame }) => [from, frame.cmdId]);

describe('Node', function () {
  it('should configure reporting', async function () {
    let received;
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        async configureReporting({ reports }) {
          received = reports;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.basic.configureReporting({
      zclVersion: { minInterval: 10, maxInterval: 4321 },
    });

    assert.strictEqual(received.length, 1, 'exactly 1 report');
  });

  it('should read attributes', async function () {
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        constructor() {
          super();
          this.dateCode = '1234';
        }

        get modelId() {
          return 'test';
        }

        get manufacturerName() {
          return 'Athom';
        }
      })(),
    );

    const res = await zclNode.endpoints[1].clusters.basic.readAttributes([
      'modelId',
      'manufacturerName',
      'clusterRevision',
      'zclVersion',
      'dateCode',
    ]);
    assert.equal(res.modelId, 'test', 'modelId should be test');
    assert.equal(res.manufacturerName, 'Athom', 'manufacturerName should be Athom');
    assert.equal(res.clusterRevision, 1, 'clusterRevision should be 1');
    assert.equal(res.zclVersion, undefined, 'zclVersion should not be present');
    assert.equal(res.dateCode, '1234', 'dateCode should be 1234');
  });

  it('should read attributes by numeric ID', async function () {
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        get modelId() {
          return 'numericTest';
        }
      })(),
    );

    // modelId has attribute ID 5
    const res = await zclNode.endpoints[1].clusters.basic.readAttributes([5]);
    assert.equal(res[5], 'numericTest', 'numeric ID 5 should return modelId value');
  });

  it('should read attributes with mixed strings and numeric IDs', async function () {
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        get modelId() {
          return 'mixedTest';
        }

        get manufacturerName() {
          return 'Athom';
        }
      })(),
    );

    // manufacturerName by name, modelId (ID 5) by numeric ID
    const res = await zclNode.endpoints[1].clusters.basic.readAttributes(['manufacturerName', 5]);
    assert.equal(res.manufacturerName, 'Athom', 'manufacturerName should resolve by name');
    assert.equal(res[5], 'mixedTest', 'numeric ID 5 should return modelId value');
  });

  it('should return both name and numeric key when same attribute requested both ways', async function () {
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        get modelId() {
          return 'both';
        }
      })(),
    );

    const res = await zclNode.endpoints[1].clusters.basic.readAttributes(['modelId', 5]);
    assert.equal(res.modelId, 'both', 'modelId key should exist');
    assert.equal(res[5], 'both', 'numeric key 5 should also exist');
  });

  it('should read an unregistered attribute by numeric ID', async function () {
    const { zclNode } = basicDevice(new BoundCluster());

    // 0x1234 is not registered in the basic cluster, expect no error and empty/missing result
    const res = await zclNode.endpoints[1].clusters.basic.readAttributes([0x1234]);
    assert.equal(res[0x1234], undefined, 'unregistered attribute should not have a value');
  });

  it('should throw for invalid numeric attribute IDs', async function () {
    const { zclNode, frames } = basicDevice(new BoundCluster());
    const { basic } = zclNode.endpoints[1].clusters;

    for (const id of [-1, 0x10000, 1.5, NaN]) {
      await assert.rejects(() => basic.readAttributes([id]), { name: 'TypeError' });
    }
    assert.deepStrictEqual(frames, [], 'nothing should be sent');
  });

  it('should read attributes without a default response when disableDefaultResponse is true', async function () {
    const { zclNode, frames, settle } = basicDevice(
      new (class extends BoundCluster {
        get modelId() {
          return 'test';
        }
      })(),
    );

    const result = await zclNode.endpoints[1].clusters.basic.readAttributes(['modelId'], {
      disableDefaultResponse: true,
    });
    await settle();

    assert.deepStrictEqual(result, { modelId: 'test' });
    assert.strictEqual(frames[0].frame.frameControl.disableDefaultResponse, true);
    // Read attributes, then its response and nothing else
    assert.deepStrictEqual(summary(frames), [
      ['zclNode', 0x00],
      ['virtualDevice', 0x01],
    ]);
  });

  it('should not respond to a group cast frame', async function () {
    const toggled = mock.fn();
    const { virtualDevice, frames, settle } = remoteSendingTo(
      new (class extends BoundCluster {
        toggle() {
          toggled();
        }
      })(),
    );

    await virtualDevice.sendFrame(1, OnOffCluster.ID, TOGGLE, { groupId: 0x01 });
    await settle();

    assert.strictEqual(toggled.mock.callCount(), 1);
    assert.deepStrictEqual(summary(frames), [['virtualDevice', 0x02]]);
  });

  it('should not send a default response to a broadcast frame', async function () {
    const toggled = mock.fn();
    const { virtualDevice, frames, settle } = remoteSendingTo(
      new (class extends BoundCluster {
        toggle() {
          toggled();
        }
      })(),
    );

    await virtualDevice.sendFrame(1, OnOffCluster.ID, TOGGLE, { broadcast: true, dstEndpoint: 1 });
    await settle();

    assert.strictEqual(toggled.mock.callCount(), 1);
    assert.deepStrictEqual(summary(frames), [['virtualDevice', 0x02]]);
  });

  it('should not send a default response error to a broadcast frame', async function () {
    const { virtualDevice, frames, settle } = remoteSendingTo(new BoundCluster());

    // toggle is not implemented, so this would otherwise get a default response error
    await virtualDevice.sendFrame(1, OnOffCluster.ID, TOGGLE, { broadcast: true });
    await settle();

    assert.deepStrictEqual(summary(frames), [['virtualDevice', 0x02]]);
  });

  it('should send a default response to a unicast frame for the broadcast endpoint', async function () {
    const { virtualDevice, frames, settle } = remoteSendingTo(
      new (class extends BoundCluster {
        toggle() {}
      })(),
    );

    await virtualDevice.sendFrame(1, OnOffCluster.ID, TOGGLE, { dstEndpoint: 0xff });
    await settle();

    assert.deepStrictEqual(summary(frames), [
      ['virtualDevice', 0x02],
      ['zclNode', 0x0b],
    ]);
  });

  it('should write attributes', async function () {
    let written;
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        get modelId() {
          return 'test';
        }

        set modelId(value) {
          written = value;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.basic.writeAttributes({ modelId: 'test1' });

    assert.strictEqual(written, 'test1');
  });

  it('should discover attributes', async function () {
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        get modelId() {
          return 'test';
        }

        get manufacturerName() {
          return 'Athom';
        }
      })(),
    );

    const attrs = await zclNode.endpoints[1].clusters.basic.discoverAttributes();
    ['modelId', 'manufacturerName'].forEach((a) => {
      assert(attrs.includes(a), `${a} is missing`);
    });
  });

  it('should discover received commands', async function () {
    const { zclNode } = basicDevice(
      new (class extends BoundCluster {
        async factoryReset() {}
      })(),
    );

    const cmds = await zclNode.endpoints[1].clusters.basic.discoverCommandsReceived();
    assert(cmds.includes('factoryReset'));
  });

  // A noData (0x00) record must not be decoded with the attribute's own type, which for an
  // attribute with id 0x0000 used to be mistaken for the record's type.
  it('should decode a noData report for an attribute with id 0x0000', async function (t) {
    class MyCluster extends Cluster {
      static get ID() {
        return 0x1234;
      }

      static get NAME() {
        return 'myCluster';
      }

      static get ATTRIBUTES() {
        return {
          priceOption: { id: 0x0000, type: ZCLDataTypes.string },
        };
      }
    }
    Cluster.addCluster(MyCluster);
    t.after(() => Cluster.removeCluster(MyCluster.ID));

    const { zclNode, virtualDevice, frames, settle } = createVirtualDevice({
      endpoints: [{ endpointId: 1, inputClusters: [MyCluster.ID] }],
    });
    const onPriceOption = mock.fn();
    zclNode.endpoints[1].clusters.myCluster.on('attr.priceOption', onPriceOption);

    // Report, server to client: attribute 0x0000, data type 0x00 (noData), no value
    await virtualDevice.sendFrame(
      1,
      MyCluster.ID,
      Buffer.from([0x18, 0x01, 0x0a, 0x00, 0x00, 0x00]),
    );
    await settle();

    assert.strictEqual(onPriceOption.mock.callCount(), 1);
    assert.deepStrictEqual(
      frames.map(({ from }) => from),
      ['virtualDevice'],
    );
  });
});
