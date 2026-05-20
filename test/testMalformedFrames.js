'use strict';

const assert = require('assert');
const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const { ZCLStandardHeader } = require('../lib/zclFrames');
const { ZCLDataTypes } = require('../lib/zclTypes');

/**
 * Helper: build a mock Node that captures every frame sent back via sendFrame.
 * Unlike `createMockNode({loopback:true})`, this lets the test inspect the
 * default-response frames that handleFrame produces (e.g. MALFORMED_COMMAND).
 */
function createCapturingNode(endpointId, inputClusterId) {
  const sentFrames = [];
  const mockNode = {
    sendFrame: async (epId, clId, data) => {
      sentFrames.push({
        endpointId: epId, clusterId: clId, raw: data,
      });
    },
    endpointDescriptors: [{
      endpointId,
      inputClusters: [inputClusterId],
      outputClusters: [],
    }],
  };
  const node = new Node(mockNode);
  return { node, sentFrames };
}

/** Parse a captured ZCL default-response frame back to {cmdId, status}. */
function parseDefaultResponse(rawFrame) {
  const frame = ZCLStandardHeader.fromBuffer(rawFrame);
  // ZCL default response cmdId is 0x0B
  if (frame.cmdId !== 0x0B) return null;
  return {
    forCmdId: frame.data.readUInt8(0),
    status: ZCLDataTypes.enum8Status.fromBuffer(frame.data, 1),
  };
}

describe('Malformed frame hardening', function() {
  describe('Cluster.handleFrame (server-to-client direction)', function() {
    it('should not invoke handler on truncated zoneStatusChangeNotification', function(done) {
      const { node } = createCapturingNode(1, IASZoneCluster.ID);

      node.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
        done(new Error(`handler invoked on malformed frame: ${JSON.stringify(data)}`));
      };

      const frame = new ZCLStandardHeader();
      frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
      frame.frameControl.directionToClient = true;
      frame.frameControl.clusterSpecific = true;
      // Empty payload: the fixed-size args (6 bytes) cannot be parsed.
      // Pre-fix behavior: silently parses as zoneStatus.alarm1=false, extendedStatus=0,
      // zoneId=0, delay=0 - a fail-open read for alarm-routing drivers.
      frame.data = Buffer.alloc(0);

      node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {})
        .then(() => done())
        .catch(done);
    });

    it('should respond with MALFORMED_COMMAND on truncated zoneStatusChangeNotification', async function() {
      const { node, sentFrames } = createCapturingNode(1, IASZoneCluster.ID);

      const frame = new ZCLStandardHeader();
      frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
      frame.frameControl.directionToClient = true;
      frame.frameControl.clusterSpecific = true;
      frame.data = Buffer.from([0x10, 0x00]); // 2 bytes, needs 6

      await node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});

      // Find the default-response frame the receiver sent back.
      const response = sentFrames
        .map(f => parseDefaultResponse(f.raw))
        .find(r => r && r.forCmdId === IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id);

      assert.ok(response, 'expected a default-response frame to be sent back');
      assert.strictEqual(response.status, 'MALFORMED_COMMAND',
        `expected MALFORMED_COMMAND, got ${response.status}`);
    });

    it('should still invoke handler on well-formed zoneStatusChangeNotification (regression)', function(done) {
      const { node } = createCapturingNode(1, IASZoneCluster.ID);

      node.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
        try {
          assert.strictEqual(data.zoneStatus.alarm1, true);
          assert.strictEqual(data.extendedStatus, 0);
          assert.strictEqual(data.zoneId, 10);
          assert.strictEqual(data.delay, 108);
          done();
        } catch (err) {
          done(err);
        }
      };

      const frame = new ZCLStandardHeader();
      frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
      frame.frameControl.directionToClient = true;
      frame.frameControl.clusterSpecific = true;
      // alarm1 bit set in zoneStatus (map16=0x0001), extendedStatus=0, zoneId=10, delay=108
      frame.data = Buffer.from([0x01, 0x00, 0x00, 0x0A, 0x6C, 0x00]);

      node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {}).catch(done);
    });
  });

  describe('BoundCluster.handleFrame (client-to-server direction)', function() {
    it('should not invoke handler on truncated zoneEnrollResponse', async function() {
      const { node } = createCapturingNode(1, IASZoneCluster.ID);

      let handlerCalled = false;
      node.endpoints[1].bind('iasZone', new (class extends BoundCluster {

        async zoneEnrollResponse(data) {
          handlerCalled = true;
          throw new Error(`handler invoked on malformed frame: ${JSON.stringify(data)}`);
        }

      })());

      const frame = new ZCLStandardHeader();
      frame.cmdId = IASZoneCluster.COMMANDS.zoneEnrollResponse.id;
      frame.frameControl.directionToClient = false;
      frame.frameControl.clusterSpecific = true;
      // Empty payload: enrollResponseCode (1 byte) and zoneId (1 byte) cannot be parsed.
      // Pre-fix behavior: silently parses as enrollResponseCode='success', zoneId=0.
      frame.data = Buffer.alloc(0);

      await node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});

      assert.strictEqual(handlerCalled, false, 'handler must not be called on truncated frame');
    });

    it('should respond with MALFORMED_COMMAND on truncated zoneEnrollResponse', async function() {
      const { node, sentFrames } = createCapturingNode(1, IASZoneCluster.ID);

      node.endpoints[1].bind('iasZone', new BoundCluster());

      const frame = new ZCLStandardHeader();
      frame.cmdId = IASZoneCluster.COMMANDS.zoneEnrollResponse.id;
      frame.frameControl.directionToClient = false;
      frame.frameControl.clusterSpecific = true;
      frame.data = Buffer.from([0x00]); // 1 byte, needs 2

      await node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});

      const response = sentFrames
        .map(f => parseDefaultResponse(f.raw))
        .find(r => r && r.forCmdId === IASZoneCluster.COMMANDS.zoneEnrollResponse.id);

      assert.ok(response, 'expected a default-response frame to be sent back');
      assert.strictEqual(response.status, 'MALFORMED_COMMAND',
        `expected MALFORMED_COMMAND, got ${response.status}`);
    });
  });
});
