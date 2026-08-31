// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const OTACluster = require('../lib/clusters/ota');
const { ZCLStandardHeader } = require('../lib/zclFrames');
const { ZCLDataTypes } = require('../lib/zclTypes');

// ZCL data-type id for map16 (declared in @athombv/data-types).
const ZCL_TYPE_ID_MAP16 = 25;

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

  describe('Attribute report (reportAttributes / cmdId 0x0A)', function() {
    /**
     * Build a reportAttributes frame carrying one attribute record.
     * @param {number} attrId
     * @param {number} typeId
     * @param {Buffer} value - the raw value bytes (may be truncated for tests).
     */
    function buildReportAttributesFrame(attrId, typeId, value) {
      const frame = new ZCLStandardHeader();
      frame.cmdId = 0x0A;
      frame.frameControl.directionToClient = true;
      frame.frameControl.clusterSpecific = false; // global command
      const header = Buffer.alloc(3);
      header.writeUInt16LE(attrId, 0);
      header.writeUInt8(typeId, 2);
      frame.data = Buffer.concat([header, value]);
      return frame;
    }

    it('should not emit attr.zoneStatus on truncated map16 value', async function() {
      const { node } = createCapturingNode(1, IASZoneCluster.ID);

      let emitted = false;
      node.endpoints[1].clusters.iasZone.on('attr.zoneStatus', () => {
        emitted = true;
      });

      // Attribute id=0x0002 (zoneStatus), type=map16, value bytes missing entirely.
      const frame = buildReportAttributesFrame(0x0002, ZCL_TYPE_ID_MAP16, Buffer.alloc(0));
      await node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});

      assert.strictEqual(emitted, false,
        'attr.zoneStatus must not fire when the map16 value bytes are missing');
    });

    it('should respond with MALFORMED_COMMAND on truncated attribute value', async function() {
      const { node, sentFrames } = createCapturingNode(1, IASZoneCluster.ID);

      // 1 byte of map16 instead of 2.
      const frame = buildReportAttributesFrame(0x0002, ZCL_TYPE_ID_MAP16, Buffer.from([0x01]));
      await node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});

      const response = sentFrames
        .map(f => parseDefaultResponse(f.raw))
        .find(r => r && r.forCmdId === 0x0A);

      assert.ok(response, 'expected a default-response frame to be sent back');
      assert.strictEqual(response.status, 'MALFORMED_COMMAND',
        `expected MALFORMED_COMMAND, got ${response.status}`);
    });

    it('should still emit attr.zoneStatus on well-formed report (regression)', async function() {
      const { node } = createCapturingNode(1, IASZoneCluster.ID);

      let received = null;
      node.endpoints[1].clusters.iasZone.on('attr.zoneStatus', val => {
        received = val;
      });

      // Full report: attrId=0x0002, typeId=map16, value=[0x01, 0x00] (alarm1 bit set).
      const value = Buffer.from([0x01, 0x00]);
      const frame = buildReportAttributesFrame(0x0002, ZCL_TYPE_ID_MAP16, value);
      await node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});

      assert.ok(received, 'attr.zoneStatus should have fired');
      assert.strictEqual(received.alarm1, true);
    });
  });

  describe('encodeMissingFieldsBehavior: "skip" - empty payload', function() {
    it('should reject empty queryNextImageRequest', async function() {
      const { node, sentFrames } = createCapturingNode(1, OTACluster.ID);
      node.endpoints[1].bind('ota', new BoundCluster());

      const frame = new ZCLStandardHeader();
      frame.cmdId = OTACluster.COMMANDS.queryNextImageRequest.id;
      frame.frameControl.directionToClient = false;
      frame.frameControl.clusterSpecific = true;
      frame.data = Buffer.alloc(0); // Pre-fix: parses with all zero-filled fields.

      await node.handleFrame(1, OTACluster.ID, frame.toBuffer(), {});

      const response = sentFrames
        .map(f => parseDefaultResponse(f.raw))
        .find(r => r && r.forCmdId === OTACluster.COMMANDS.queryNextImageRequest.id);

      assert.ok(response, 'expected a default-response frame');
      assert.strictEqual(response.status, 'MALFORMED_COMMAND',
        `expected MALFORMED_COMMAND, got ${response.status}`);
    });

    it('should still accept queryNextImageRequest without trailing hardwareVersion (regression)', async function() {
      const { node } = createCapturingNode(1, OTACluster.ID);

      let receivedArgs = null;
      node.endpoints[1].bind('ota', new (class extends BoundCluster {

        async queryNextImageRequest(args) {
          receivedArgs = args;
          return { status: 'NO_IMAGE_AVAILABLE' };
        }

      })());

      const frame = new ZCLStandardHeader();
      frame.cmdId = OTACluster.COMMANDS.queryNextImageRequest.id;
      frame.frameControl.directionToClient = false;
      frame.frameControl.clusterSpecific = true;
      // 9 bytes: fieldControl(1) + manufacturerCode(2) + imageType(2) + fileVersion(4).
      // Trailing hardwareVersion(2) omitted because fieldControl bit 0 is not set.
      frame.data = Buffer.from([
        0x00, // fieldControl
        0x34, 0x12, // manufacturerCode = 0x1234
        0x21, 0x43, // imageType = 0x4321
        0x01, 0x00, 0x00, 0x00, // fileVersion = 1
      ]);

      await node.handleFrame(1, OTACluster.ID, frame.toBuffer(), {});

      assert.ok(receivedArgs, 'handler should have been called');
      assert.strictEqual(receivedArgs.manufacturerCode, 0x1234);
      assert.strictEqual(receivedArgs.imageType, 0x4321);
    });
  });
});
