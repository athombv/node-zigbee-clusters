// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Cluster = require('../lib/Cluster');
const Node = require('../lib/Node');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const AlarmsCluster = require('../lib/clusters/alarms');

const sandbox = sinon.createSandbox();

describe('Cluster Response Timeout', function() {
  let receivingNode;
  let sendingNode;

  beforeEach(function() {
    sendingNode = new Node({
      // Forward frames to receiving node
      sendFrame: (...args) => {
        receivingNode.handleFrame(...args);
      },
      endpointDescriptors: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });

    receivingNode = new Node({
      // Forward frames to sending node
      sendFrame: (...args) => {
        sendingNode.handleFrame(...args);
      },
      endpointDescriptors: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should only start timeout after frame is sent', async function() {
    const originalSendFrame = sendingNode.endpoints[1].sendFrame.bind(sendingNode.endpoints[1]);
    sandbox.stub(sendingNode.endpoints[1], 'sendFrame').callsFake(async (...args) => {
      // Delay sendFrame by 150ms (longer than timeout)
      await new Promise(resolve => setTimeout(resolve, 150));
      return originalSendFrame(...args);
    });

    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      toggle() {
        // Respond immediately
      }

    }());

    // Start the command with 100ms timeout, if timeout starts immediately it will fire before
    // sendFrame completes and cause the command to fail
    await sendingNode.endpoints[1].clusters.onOff.toggle(undefined, { timeout: 100 });
  });

  it('should clear timeout when response is received', async function() {
    const clearTimeoutSpy = sandbox.spy(global, 'clearTimeout');

    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      async toggle() {
        // Respond after sendFrame resolved
        return new Promise(resolve => setImmediate(resolve));
      }

    }());

    await sendingNode.endpoints[1].clusters.onOff.toggle(undefined, { timeout: 5000 });

    // Should have called clearTimeout to prevent timeout firing
    assert(clearTimeoutSpy.called, 'clearTimeout should be called when response received');
  });

  it('should not wait for response when waitForResponse is false', async function() {
    const sendingNodeSendFrameSpy = sandbox.spy(sendingNode, 'sendFrame');

    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      toggle() {

        // Respond with default response
      }

    }());

    // Send command without waiting for response
    const result = await sendingNode.endpoints[1].clusters.onOff.toggle({ waitForResponse: false });

    // Should return undefined since we're not waiting
    assert.strictEqual(result, undefined);

    // Only one frame should be sent (the command itself)
    assert.strictEqual(sendingNodeSendFrameSpy.callCount, 1);
  });

  it('should not resolve with a device-initiated frame that reuses the pending TSN', async function() {
    const reportedValues = [];
    sendingNode.endpoints[1].clusters.onOff.on('attr.onOff', value => reportedValues.push(value));

    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      async toggle(args, meta, frame) {
        // Device sends an attribute report numbered from its own counter, colliding with the TSN
        await sendingNode.handleFrame(1, OnOffCluster.ID, Buffer.from([
          0x18, frame.trxSequenceNumber, 0x0A, 0x00, 0x00, 0x10, 0x01,
        ]));
      }

    }());

    const result = await sendingNode.endpoints[1].clusters.onOff.toggle();

    assert.deepStrictEqual(reportedValues, [true]);
    assert.strictEqual(result, undefined);
  });

  it('should resolve getAlarm with a Get Alarm Response alone', async function() {
    const pair = [AlarmsCluster.ID];
    const sender = new Node({
      // eslint-disable-next-line no-use-before-define
      sendFrame: (...args) => receiver.handleFrame(...args),
      endpointDescriptors: [{ endpointId: 1, inputClusters: pair }],
    });
    const receiver = new Node({
      sendFrame: (...args) => sender.handleFrame(...args),
      endpointDescriptors: [{ endpointId: 1, inputClusters: pair }],
    });
    receiver.endpoints[1].bind('alarms', new class extends BoundCluster {

      getAlarm() {
        return {
          status: 'SUCCESS', alarmCode: 2, clusterId: 6, timeStamp: 1234,
        };
      }

    }());

    const { alarms } = sender.endpoints[1].clusters;
    const response = await alarms.getAlarm(undefined, { timeout: 1000 });

    assert.strictEqual(response.alarmCode, 2);
    assert.strictEqual(response.timeStamp, 1234);
  });

  it('should resolve a command without declared response on a cluster-specific reply', async function() {
    class TuyaLikeCluster extends Cluster {

      static get ID() {
        return 0xEF00;
      }

      static get NAME() {
        return 'tuyaLike';
      }

      static get COMMANDS() {
        return {
          datapoint: { id: 0x00, args: { value: ZCLDataTypes.uint8 } },
          dataResponse: {
            id: 0x01,
            direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
            args: { value: ZCLDataTypes.uint8 },
          },
        };
      }

    }
    Cluster.addCluster(TuyaLikeCluster);

    try {
      const pair = [TuyaLikeCluster.ID];
      const sender = new Node({
        // eslint-disable-next-line no-use-before-define
        sendFrame: (...args) => receiver.handleFrame(...args),
        endpointDescriptors: [{ endpointId: 1, inputClusters: pair }],
      });
      const receiver = new Node({
        sendFrame: (...args) => sender.handleFrame(...args),
        endpointDescriptors: [{ endpointId: 1, inputClusters: pair }],
      });
      receiver.endpoints[1].bind('tuyaLike', new class extends BoundCluster {

        // Reply like a Tuya MCU: its own command with the request's TSN, no Default Response
        async datapoint({ value }, meta, frame) {
          await sender.handleFrame(1, TuyaLikeCluster.ID, Buffer.from([
            0x19, frame.trxSequenceNumber, 0x01, value,
          ]));
        }

      }());

      const { tuyaLike } = sender.endpoints[1].clusters;
      const response = await tuyaLike.datapoint(
        { value: 7 }, { disableDefaultResponse: true, timeout: 1000 },
      );

      assert.strictEqual(response.value, 7);
    } finally {
      Cluster.removeCluster(TuyaLikeCluster.ID);
    }
  });
});
