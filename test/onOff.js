'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const { createVirtualDevice } = require('./util');

describe('On/Off', function () {
  it('should receive setOn', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });

    let called = false;
    virtualDevice.endpoints[1].bind(
      'onOff',
      new (class extends BoundCluster {
        async setOn() {
          called = true;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.onOff.setOn();
    assert.strictEqual(called, true);
  });

  it('should receive setOff', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });

    let called = false;
    virtualDevice.endpoints[1].bind(
      'onOff',
      new (class extends BoundCluster {
        async setOff() {
          called = true;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.onOff.setOff();
    assert.strictEqual(called, true);
  });

  it('should receive toggle', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });

    let called = false;
    virtualDevice.endpoints[1].bind(
      'onOff',
      new (class extends BoundCluster {
        async toggle() {
          called = true;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.onOff.toggle();
    assert.strictEqual(called, true);
  });

  it('should receive onWithTimedOff', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'onOff',
      new (class extends BoundCluster {
        async onWithTimedOff(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.onOff.onWithTimedOff({
      onOffControl: 0x01,
      onTime: 100,
      offWaitTime: 50,
    });

    assert.strictEqual(receivedData.onOffControl, 0x01);
    assert.strictEqual(receivedData.onTime, 100);
    assert.strictEqual(receivedData.offWaitTime, 50);
  });
});
