// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const { createMockNode } = require('./util');

describe('On/Off', function() {
  it('should receive setOn', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    let called = false;
    node.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOn() {
        called = true;
      }

    })());

    await node.endpoints[1].clusters.onOff.setOn();
    assert.strictEqual(called, true);
  });

  it('should receive setOff', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    let called = false;
    node.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async setOff() {
        called = true;
      }

    })());

    await node.endpoints[1].clusters.onOff.setOff();
    assert.strictEqual(called, true);
  });

  it('should receive toggle', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    let called = false;
    node.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async toggle() {
        called = true;
      }

    })());

    await node.endpoints[1].clusters.onOff.toggle();
    assert.strictEqual(called, true);
  });

  it('should receive onWithTimedOff', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('onOff', new (class extends BoundCluster {

      async onWithTimedOff(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.onOff.onWithTimedOff({
      onOffControl: 0x01,
      onTime: 100,
      offWaitTime: 50,
    });

    assert.strictEqual(receivedData.onOffControl, 0x01);
    assert.strictEqual(receivedData.onTime, 100);
    assert.strictEqual(receivedData.offWaitTime, 50);
  });
});
