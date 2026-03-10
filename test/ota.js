// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const Node = require('../lib/Node');
const OTACluster = require('../lib/clusters/ota');

// ZCL Standard Header: frameControl(1), trxSequenceNumber(1), cmdId(1), data(rest)
const ZCL_HEADER_SIZE = 3;

// OTA cluster command IDs
const CMD_QUERY_NEXT_IMAGE_REQUEST = OTACluster.COMMANDS.queryNextImageRequest.id;
const CMD_QUERY_NEXT_IMAGE_RESPONSE = OTACluster.COMMANDS.queryNextImageRequest.response.id;

/**
 * Creates a mock node that captures raw ZCL frame buffers from every sendFrame call,
 * with loopback so frames are handled by the same node.
 */
function createCapturingNode() {
  const capturedFrames = [];
  let node;

  const mockNode = {
    sendFrame: (endpointId, clusterId, buffer) => {
      capturedFrames.push(buffer);
      return node.handleFrame(endpointId, clusterId, buffer, {});
    },
    endpointDescriptors: [{
      endpointId: 1,
      inputClusters: [OTACluster.ID],
      outputClusters: [],
    }],
  };

  node = new Node(mockNode);
  return { node, capturedFrames };
}

describe('OTA', function() {
  // --- queryNextImageRequest: encodeMissingFieldsBehavior on the request ---

  it('should NOT encode hardwareVersion when omitted from queryNextImageRequest', async function() {
    const { node, capturedFrames } = createCapturingNode();

    let receivedData = null;
    node.endpoints[1].bind('ota', new (class extends BoundCluster {

      async queryNextImageRequest(data) {
        receivedData = data;
        return { status: 'NO_IMAGE_AVAILABLE' };
      }

    })());

    await node.endpoints[1].clusters.ota.queryNextImageRequest({
      fieldControl: 0,
      manufacturerCode: 0x1234,
      imageType: 0x0001,
      fileVersion: 0x00000010,
      // hardwareVersion intentionally omitted
    });

    const requestFrame = capturedFrames.find(buf => buf[2] === CMD_QUERY_NEXT_IMAGE_REQUEST);
    assert.ok(requestFrame, 'request frame not captured');

    // fieldControl(1) + manufacturerCode(2) + imageType(2) + fileVersion(4) = 9 bytes
    // hardwareVersion (2 bytes) must NOT be present
    const payload = requestFrame.slice(ZCL_HEADER_SIZE);
    assert.strictEqual(
      payload.length,
      9,
      `payload must be 9 bytes (no hardwareVersion), got ${payload.length}`,
    );

    // Absent fields decode as 0 (decoder reads from exhausted buffer)
    assert.strictEqual(receivedData.manufacturerCode, 0x1234);
    assert.strictEqual(receivedData.imageType, 0x0001);
    assert.strictEqual(receivedData.fileVersion, 0x00000010);
    assert.strictEqual(receivedData.hardwareVersion, 0);
  });

  it('should encode hardwareVersion when provided in queryNextImageRequest', async function() {
    const { node, capturedFrames } = createCapturingNode();

    node.endpoints[1].bind('ota', new (class extends BoundCluster {

      async queryNextImageRequest() {
        return { status: 'NO_IMAGE_AVAILABLE' };
      }

    })());

    await node.endpoints[1].clusters.ota.queryNextImageRequest({
      fieldControl: ['hardwareVersionPresent'],
      manufacturerCode: 0x1234,
      imageType: 0x0001,
      fileVersion: 0x00000010,
      hardwareVersion: 0x0002,
    });

    const requestFrame = capturedFrames.find(buf => buf[2] === CMD_QUERY_NEXT_IMAGE_REQUEST);
    assert.ok(requestFrame, 'request frame not captured');

    // fieldControl(1) + manufacturerCode(2) + imageType(2) + fileVersion(4)
    // + hardwareVersion(2) = 11 bytes
    const payload = requestFrame.slice(ZCL_HEADER_SIZE);
    assert.strictEqual(
      payload.length,
      11,
      `payload must be 11 bytes (with hardwareVersion), got ${payload.length}`,
    );

    // hardwareVersion is at bytes 9-10 (LE uint16)
    assert.strictEqual(payload.readUInt16LE(9), 0x0002);
  });

  // --- queryNextImageResponse: encodeMissingFieldsBehavior on the response ---

  it('should encode all fields in queryNextImageResponse when status is SUCCESS', async function() {
    const { node, capturedFrames } = createCapturingNode();

    node.endpoints[1].bind('ota', new (class extends BoundCluster {

      async queryNextImageRequest() {
        return {
          status: 'SUCCESS',
          manufacturerCode: 0x1234,
          imageType: 0x0001,
          fileVersion: 0x00000020,
          imageSize: 0x00010000,
        };
      }

    })());

    const response = await node.endpoints[1].clusters.ota.queryNextImageRequest({
      fieldControl: 0,
      manufacturerCode: 0x1234,
      imageType: 0x0001,
      fileVersion: 0x00000010,
    });

    const responseFrame = capturedFrames.find(buf => buf[2] === CMD_QUERY_NEXT_IMAGE_RESPONSE);
    assert.ok(responseFrame, 'response frame not captured');

    // status(1) + manufacturerCode(2) + imageType(2) + fileVersion(4) + imageSize(4) = 13 bytes
    const payload = responseFrame.slice(ZCL_HEADER_SIZE);
    assert.strictEqual(
      payload.length,
      13,
      `payload must be 13 bytes (all fields), got ${payload.length}`,
    );

    assert.strictEqual(response.status, 'SUCCESS');
    assert.strictEqual(response.manufacturerCode, 0x1234);
    assert.strictEqual(response.imageType, 0x0001);
    assert.strictEqual(response.fileVersion, 0x00000020);
    assert.strictEqual(response.imageSize, 0x00010000);
  });

  it('should encode only the status byte in queryNextImageResponse when status is NO_IMAGE_AVAILABLE',
    async function() {
      const { node, capturedFrames } = createCapturingNode();

      node.endpoints[1].bind('ota', new (class extends BoundCluster {

        async queryNextImageRequest() {
          return { status: 'NO_IMAGE_AVAILABLE' };
        }

      })());

      const response = await node.endpoints[1].clusters.ota.queryNextImageRequest({
        fieldControl: 0,
        manufacturerCode: 0x1234,
        imageType: 0x0001,
        fileVersion: 0x00000010,
      });

      const responseFrame = capturedFrames.find(buf => buf[2] === CMD_QUERY_NEXT_IMAGE_RESPONSE);
      assert.ok(responseFrame, 'response frame not captured');

      // Only status(1) — all other fields must be absent
      const payload = responseFrame.slice(ZCL_HEADER_SIZE);
      assert.strictEqual(
        payload.length,
        1,
        `payload must be 1 byte (status only), got ${payload.length}`,
      );
      assert.strictEqual(payload[0], 0x98, 'status byte must be NO_IMAGE_AVAILABLE (0x98)');

      assert.strictEqual(response.status, 'NO_IMAGE_AVAILABLE');
      // Absent fields decode as 0 (decoder reads from exhausted buffer)
      assert.strictEqual(response.manufacturerCode, 0);
      assert.strictEqual(response.imageType, 0);
      assert.strictEqual(response.fileVersion, 0);
      assert.strictEqual(response.imageSize, 0);
    });
});
