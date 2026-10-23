'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');
const BasicCluster = require('../lib/clusters/basic');
const OnOffCluster = require('../lib/clusters/onOff');

const sandbox = sinon.createSandbox();

describe('Transaction sequence number', function() {
  let receivingNode;
  let sendingNode;
  let sentTrxSequenceNumbers;

  beforeEach(function() {
    sentTrxSequenceNumbers = [];
    sendingNode = new Node({
      sendFrame: (endpointId, clusterId, frame) => {
        sentTrxSequenceNumbers.push(frame[1]);
        receivingNode.handleFrame(endpointId, clusterId, frame);
      },
      endpointDescriptors: [
        { endpointId: 1, inputClusters: [OnOffCluster.ID] },
        { endpointId: 2, inputClusters: [BasicCluster.ID] },
      ],
    });

    receivingNode = new Node({
      sendFrame: (...args) => {
        sendingNode.handleFrame(...args);
      },
      endpointDescriptors: [
        { endpointId: 1, inputClusters: [OnOffCluster.ID] },
        { endpointId: 2, inputClusters: [BasicCluster.ID] },
      ],
    });
    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      toggle() {}

    }());
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should share one counter across endpoints and clusters', async function() {
    await sendingNode.endpoints[1].clusters.onOff.toggle();
    const { basic } = sendingNode.endpoints[2].clusters;
    await basic.factoryReset(undefined, { waitForResponse: false });
    await sendingNode.endpoints[1].clusters.onOff.toggle();

    const [first] = sentTrxSequenceNumbers;
    assert.deepStrictEqual(sentTrxSequenceNumbers, [first, (first + 1) % 256, (first + 2) % 256]);
  });

  it('should start at a random value and wrap around', function() {
    sandbox.stub(Math, 'random').returns(0.999);
    const node = new Node({ sendFrame: () => {}, endpointDescriptors: [] });

    assert.strictEqual(node.nextSeqNr(), 0);
    assert.strictEqual(node.nextSeqNr(), 1);
  });
});
