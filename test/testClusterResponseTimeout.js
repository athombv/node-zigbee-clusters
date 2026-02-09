// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');

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
});
