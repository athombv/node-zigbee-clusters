// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const ColorControlCluster = require('../lib/clusters/colorControl');
const { createMockNode } = require('./util');

describe('Color Control', function() {
  it('should receive moveToColor', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('colorControl', new (class extends BoundCluster {

      async moveToColor(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.colorControl.moveToColor({
      colorX: 0x5000,
      colorY: 0x3000,
      transitionTime: 20,
    });

    assert.strictEqual(receivedData.colorX, 0x5000);
    assert.strictEqual(receivedData.colorY, 0x3000);
    assert.strictEqual(receivedData.transitionTime, 20);
  });

  it('should receive moveToColorTemperature', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('colorControl', new (class extends BoundCluster {

      async moveToColorTemperature(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.colorControl.moveToColorTemperature({
      colorTemperature: 370,
      transitionTime: 15,
    });

    assert.strictEqual(receivedData.colorTemperature, 370);
    assert.strictEqual(receivedData.transitionTime, 15);
  });

  it('should receive moveToHueAndSaturation', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('colorControl', new (class extends BoundCluster {

      async moveToHueAndSaturation(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.colorControl.moveToHueAndSaturation({
      hue: 180,
      saturation: 200,
      transitionTime: 10,
    });

    assert.strictEqual(receivedData.hue, 180);
    assert.strictEqual(receivedData.saturation, 200);
    assert.strictEqual(receivedData.transitionTime, 10);
  });
});
