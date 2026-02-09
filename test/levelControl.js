// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const { createMockNode } = require('./util');
require('../lib/clusters/levelControl');

describe('Level Control', function() {
  it('should receive moveToLevel', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [8],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('levelControl', new (class extends BoundCluster {

      async moveToLevel(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.levelControl.moveToLevel({
      level: 128,
      transitionTime: 10,
    });

    assert.strictEqual(receivedData.level, 128);
    assert.strictEqual(receivedData.transitionTime, 10);
  });

  it('should receive step', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [8],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('levelControl', new (class extends BoundCluster {

      async step(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.levelControl.step({
      mode: 'up',
      stepSize: 50,
      transitionTime: 5,
    });

    assert.strictEqual(receivedData.mode, 'up');
    assert.strictEqual(receivedData.stepSize, 50);
    assert.strictEqual(receivedData.transitionTime, 5);
  });

  it('should receive stop', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [8],
      }],
    });

    let called = false;
    node.endpoints[1].bind('levelControl', new (class extends BoundCluster {

      async stop() {
        called = true;
      }

    })());

    await node.endpoints[1].clusters.levelControl.stop();
    assert.strictEqual(called, true);
  });
});
