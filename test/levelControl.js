'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const BoundCluster = require('../lib/BoundCluster');
const LevelControlCluster = require('../lib/clusters/levelControl');
const { createVirtualDevice } = require('./util');

describe('Level Control', function () {
  it('should receive moveToLevel', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [LevelControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'levelControl',
      new (class extends BoundCluster {
        async moveToLevel(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.levelControl.moveToLevel({
      level: 128,
      transitionTime: 10,
    });

    assert.strictEqual(receivedData.level, 128);
    assert.strictEqual(receivedData.transitionTime, 10);
  });

  it('should receive step', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [LevelControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'levelControl',
      new (class extends BoundCluster {
        async step(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.levelControl.step({
      mode: 'up',
      stepSize: 50,
      transitionTime: 5,
    });

    assert.strictEqual(receivedData.mode, 'up');
    assert.strictEqual(receivedData.stepSize, 50);
    assert.strictEqual(receivedData.transitionTime, 5);
  });

  it('should receive stop', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [LevelControlCluster.ID],
        },
      ],
    });

    let called = false;
    virtualDevice.endpoints[1].bind(
      'levelControl',
      new (class extends BoundCluster {
        async stop() {
          called = true;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.levelControl.stop();
    assert.strictEqual(called, true);
  });
});
