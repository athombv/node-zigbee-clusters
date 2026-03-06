/* eslint-disable max-classes-per-file */

'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const Node = require('../lib/Node');
const OnOffCluster = require('../lib/clusters/onOff');
const { ZCLStandardHeader } = require('../lib/zclFrames');
const { ZCLError } = require('../lib/util');
const { createMockNode } = require('./util');

/**
 * Creates a connected node pair where frames sent from the device back to the controller
 * are captured before being forwarded.
 */
function createSpyNodePair() {
  const capturedFrames = [];
  let controllerNode;
  let deviceNode;

  const mockController = {
    sendFrame: (endpointId, clusterId, data) => deviceNode.handleFrame(endpointId, clusterId, data),
    endpointDescriptors: [{ endpointId: 1, inputClusters: [OnOffCluster.ID], outputClusters: [] }],
  };

  const mockDevice = {
    sendFrame: (endpointId, clusterId, data) => {
      capturedFrames.push({ endpointId, clusterId, data });
      return controllerNode.handleFrame(endpointId, clusterId, data);
    },
    endpointDescriptors: [{ endpointId: 1, inputClusters: [OnOffCluster.ID], outputClusters: [] }],
  };

  controllerNode = new Node(mockController);
  deviceNode = new Node(mockDevice);

  return { controllerNode, deviceNode, capturedFrames };
}

describe('ZCLError handling', function() {
  it('should return ZCLError status code in Default Response when BoundCluster throws ZCLError', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    node.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOn() {
        throw new ZCLError('NOT_AUTHORIZED');
      }

    })());

    await assert.rejects(
      () => node.endpoints[1].clusters.onOff.setOn(),
      err => {
        assert.strictEqual(err.message, 'NOT_AUTHORIZED');
        return true;
      },
    );
  });

  it('should return FAILURE status in Default Response when BoundCluster throws a generic Error', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    node.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOn() {
        throw new Error('something went wrong');
      }

    })());

    await assert.rejects(
      () => node.endpoints[1].clusters.onOff.setOn(),
      err => {
        assert.strictEqual(err.message, 'FAILURE');
        return true;
      },
    );
  });

  it('should encode ZCLError status code in Default Response frame bytes', async function() {
    // NOT_AUTHORIZED = 0x7e per ZCL spec
    const NOT_AUTHORIZED_STATUS_BYTE = 0x7e;
    const SET_ON_CMD_ID = OnOffCluster.COMMANDS.setOn.id;
    const DEFAULT_RESPONSE_CMD_ID = 0x0B;

    const { controllerNode, deviceNode, capturedFrames } = createSpyNodePair();

    deviceNode.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOn() {
        throw new ZCLError('NOT_AUTHORIZED');
      }

    })());

    await assert.rejects(() => controllerNode.endpoints[1].clusters.onOff.setOn());

    // capturedFrames only contains frames sent from the device back to the controller.
    // Find the Default Response frame among the captured device → controller frames.
    const defaultResponseFrame = capturedFrames
      .map(f => ZCLStandardHeader.fromBuffer(f.data))
      .find(frame => frame.cmdId === DEFAULT_RESPONSE_CMD_ID);

    assert.ok(defaultResponseFrame, 'Default Response frame was sent');
    assert.strictEqual(defaultResponseFrame.data[0], SET_ON_CMD_ID,
      'Default Response should reference the received setOn command ID');
    assert.strictEqual(defaultResponseFrame.data[1], NOT_AUTHORIZED_STATUS_BYTE,
      'Default Response should encode NOT_AUTHORIZED (0x7e) as the status byte');
  });

  it('should encode FAILURE (0x01) in Default Response frame bytes when a generic Error is thrown', async function() {
    const FAILURE_STATUS_BYTE = 0x01;
    const SET_ON_CMD_ID = OnOffCluster.COMMANDS.setOn.id;
    const DEFAULT_RESPONSE_CMD_ID = 0x0B;

    const { controllerNode, deviceNode, capturedFrames } = createSpyNodePair();

    deviceNode.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOn() {
        throw new Error('something went wrong');
      }

    })());

    await assert.rejects(() => controllerNode.endpoints[1].clusters.onOff.setOn());

    const defaultResponseFrame = capturedFrames
      .map(f => ZCLStandardHeader.fromBuffer(f.data))
      .find(frame => frame.cmdId === DEFAULT_RESPONSE_CMD_ID);

    assert.ok(defaultResponseFrame, 'Default Response frame was sent');
    assert.strictEqual(defaultResponseFrame.data[0], SET_ON_CMD_ID,
      'Default Response should reference the received setOn command ID');
    assert.strictEqual(defaultResponseFrame.data[1], FAILURE_STATUS_BYTE,
      'Default Response should encode FAILURE (0x01) as the status byte');
  });

  it('should send SUCCESS status byte when ZCLError("SUCCESS") is thrown', async function() {
    const SUCCESS_STATUS_BYTE = 0x00;
    const SET_ON_CMD_ID = OnOffCluster.COMMANDS.setOn.id;
    const DEFAULT_RESPONSE_CMD_ID = 0x0B;

    const { controllerNode, deviceNode, capturedFrames } = createSpyNodePair();

    deviceNode.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOn() {
        throw new ZCLError('SUCCESS');
      }

    })());

    // The controller should not reject — a SUCCESS default response resolves the command
    await controllerNode.endpoints[1].clusters.onOff.setOn();

    const defaultResponseFrame = capturedFrames
      .map(f => ZCLStandardHeader.fromBuffer(f.data))
      .find(frame => frame.cmdId === DEFAULT_RESPONSE_CMD_ID);

    assert.ok(defaultResponseFrame, 'Default Response frame was sent');
    assert.strictEqual(defaultResponseFrame.data[0], SET_ON_CMD_ID,
      'Default Response should reference the received setOn command ID');
    assert.strictEqual(defaultResponseFrame.data[1], SUCCESS_STATUS_BYTE,
      'Default Response should encode SUCCESS (0x00) as the status byte');
  });

  it('should propagate different ZCLError status codes', async function() {
    const statuses = ['NOT_AUTHORIZED', 'INVALID_VALUE', 'INSUFFICIENT_SPACE'];

    for (const status of statuses) {
      const node = createMockNode({
        loopback: true,
        endpoints: [{
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        }],
      });

      node.endpoints[1].bind('onOff', new (class extends BoundCluster {

        async setOn() {
          throw new ZCLError(status);
        }

      })());

      // eslint-disable-next-line no-await-in-loop
      await assert.rejects(
        () => node.endpoints[1].clusters.onOff.setOn(),
        err => {
          assert.strictEqual(err.message, status);
          return true;
        },
      );
    }
  });
});
