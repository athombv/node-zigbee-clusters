'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Cluster = require('../lib/Cluster');
const Node = require('../lib/Node');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const AlarmsCluster = require('../lib/clusters/alarms');
const IasZoneCluster = require('../lib/clusters/iasZone');

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

  it('should treat a declared response without id as the command id', async function() {
    class EchoCluster extends Cluster {

      static get ID() {
        return 0xFC01;
      }

      static get NAME() {
        return 'echo';
      }

      static get COMMANDS() {
        return {
          ping: {
            id: 0x05,
            args: { value: ZCLDataTypes.uint8 },
            response: { args: { value: ZCLDataTypes.uint8 } },
          },
          notify: {
            id: 0x06,
            direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
            args: { value: ZCLDataTypes.uint8 },
          },
        };
      }

    }
    Cluster.addCluster(EchoCluster);

    try {
      const pair = [EchoCluster.ID];
      const sender = new Node({
        sendFrame: (...args) => receiver.handleFrame(...args),
        endpointDescriptors: [{ endpointId: 1, inputClusters: pair }],
      });
      const receiver = new Node({
        sendFrame: (...args) => sender.handleFrame(...args),
        endpointDescriptors: [{ endpointId: 1, inputClusters: pair }],
      });
      receiver.endpoints[1].bind('echo', new class extends BoundCluster {

        // An unrelated device command reuses the TSN first, then the real response (id 0x05)
        async ping({ value }, meta, frame) {
          await sender.handleFrame(1, EchoCluster.ID, Buffer.from([
            0x19, frame.trxSequenceNumber, 0x06, 99,
          ]));
          return { value };
        }

      }());

      const { echo } = sender.endpoints[1].clusters;
      const response = await echo.ping({ value: 7 }, { timeout: 1000 });

      assert.strictEqual(response.value, 7);
    } finally {
      Cluster.removeCluster(EchoCluster.ID);
    }
  });

  describe('pending response matching', function() {
    // Node pair where the receiving side first sends `colliding(tsn)` with the request's TSN,
    // then its real reply
    function createCollidingPair(clusterId, colliding) {
      const descriptors = [{ endpointId: 1, inputClusters: [clusterId] }];
      const sender = new Node({
        sendFrame: (...args) => receiver.handleFrame(...args),
        endpointDescriptors: descriptors,
      });
      const receiver = new Node({
        sendFrame: async (endpointId, frameClusterId, frame) => {
          await sender.handleFrame(endpointId, frameClusterId, colliding(frame[1]));
          await sender.handleFrame(endpointId, frameClusterId, frame);
        },
        endpointDescriptors: descriptors,
      });
      return { sender, receiver };
    }

    it('should not resolve a global command on a cluster-specific frame with its response id', async function() {
      // IAS Zone Enroll Request is cluster-specific 0x01, the same id as Read Attributes Response
      const { sender, receiver } = createCollidingPair(IasZoneCluster.ID, tsn => Buffer.from([
        0x19, tsn, 0x01, 0x0D, 0x00, 0x00, 0x00,
      ]));
      receiver.endpoints[1].bind('iasZone', new class extends BoundCluster {

        get zoneState() {
          return 'enrolled';
        }

      }());

      const { iasZone } = sender.endpoints[1].clusters;
      const result = await iasZone.readAttributes(['zoneState'], { timeout: 1000 });

      assert.deepStrictEqual(result, { zoneState: 'enrolled' });
    });

    it('should not resolve on a Default Response for another command', async function() {
      // Default Response with FAILURE for cmdId 0x01 (on), while toggle (0x02) is pending
      const { sender, receiver } = createCollidingPair(OnOffCluster.ID, tsn => Buffer.from([
        0x18, tsn, 0x0B, 0x01, 0x01,
      ]));
      receiver.endpoints[1].bind('onOff', new class extends BoundCluster {

        toggle() {}

      }());

      await sender.endpoints[1].clusters.onOff.toggle(undefined, { timeout: 1000 });
    });
  });

  it('should resolve when the response arrives before sendFrame rejects', async function() {
    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      toggle() {}

    }());
    sendingNode.sendFrame = async (endpointId, clusterId, frame) => {
      await receivingNode.handleFrame(endpointId, clusterId, frame);
      throw new Error('device not responding');
    };

    await sendingNode.endpoints[1].clusters.onOff.toggle();
  });

  it('should reject when sendFrame rejects without a response', async function() {
    sendingNode.sendFrame = async () => {
      throw new Error('device not responding');
    };

    await assert.rejects(sendingNode.endpoints[1].clusters.onOff.toggle(), /device not responding/);
  });
});
