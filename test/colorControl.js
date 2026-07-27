// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const sinon = require('sinon');

const BoundCluster = require('../lib/BoundCluster');
const ColorControlCluster = require('../lib/clusters/colorControl');
const Endpoint = require('../lib/Endpoint');
const { createMockNode } = require('./util');

const sandbox = sinon.createSandbox();

// Sends colorLoopSet on a fresh node and returns the parsed outgoing frame, so tests can assert
// the payload bytes against the ZCL spec instead of round-tripping through our own definition
async function sendColorLoopSet(args) {
  const node = createMockNode({
    loopback: true,
    endpoints: [{
      endpointId: 1,
      inputClusters: [ColorControlCluster.ID],
    }],
  });

  node.endpoints[1].bind('colorControl', new (class extends BoundCluster {

    async colorLoopSet() {
      // Accept the command so no error response is generated
    }

  })());

  const sendFrameSpy = sandbox.spy(node, 'sendFrame');
  await node.endpoints[1].clusters.colorControl.colorLoopSet(args);

  return Endpoint.parseFrame(sendFrameSpy.getCall(0).args[2]);
}

describe('Color Control', function() {
  afterEach(function() {
    sandbox.restore();
  });

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

  it('should receive colorLoopSet', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('colorControl', new (class extends BoundCluster {

      async colorLoopSet(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.colorControl.colorLoopSet({
      updateFlags: ['updateAction', 'updateDirection', 'updateTime', 'updateStartHue'],
      action: 'activateFromColorLoopStartEnhancedHue',
      direction: 'incrementHue',
      time: 30,
      startHue: 0x2300,
    });

    assert.deepStrictEqual(receivedData.updateFlags.getBits(), [
      'updateAction', 'updateDirection', 'updateTime', 'updateStartHue',
    ]);
    assert.strictEqual(receivedData.action, 'activateFromColorLoopStartEnhancedHue');
    assert.strictEqual(receivedData.direction, 'incrementHue');
    assert.strictEqual(receivedData.time, 30);
    assert.strictEqual(receivedData.startHue, 0x2300);
  });

  // The loopback test above encodes and decodes with the same definition, so it passes even when
  // that definition is wrong on the wire. These bytes come from the spec, not from our types:
  // ZCL r8 Figure 5-17 (payload layout), Figure 5-18 (updateFlags bits), Table 5.25 (action
  // values), Table 5.26 (direction values), Table 5.13 (command id).
  it('should encode colorLoopSet as specified by the ZCL', async function() {
    const frame = await sendColorLoopSet({
      updateFlags: ['updateAction', 'updateStartHue'], // Bits 0 and 3, so 0x09
      action: 'activateFromEnhancedCurrentHue', // 0x02
      direction: 'decrementHue', // 0x00
      time: 0x1234, // uint16 little endian, so 34 12
      startHue: 0x2300, // uint16 little endian, so 00 23
    });

    assert.strictEqual(frame.cmdId, 0x44);
    assert.deepStrictEqual(frame.data, Buffer.from([0x09, 0x02, 0x00, 0x34, 0x12, 0x00, 0x23]));
  });

  // Setting every flag at once cannot tell the bit positions apart, so pin each one separately
  it('should encode each colorLoopSet update flag on its own bit', async function() {
    const flagBits = [
      ['updateAction', 0x01],
      ['updateDirection', 0x02],
      ['updateTime', 0x04],
      ['updateStartHue', 0x08],
    ];

    for (const [flag, expectedByte] of flagBits) {
      // eslint-disable-next-line no-await-in-loop
      const frame = await sendColorLoopSet({
        updateFlags: [flag],
        action: 'deactivate',
        direction: 'decrementHue',
        time: 0,
        startHue: 0,
      });

      assert.strictEqual(frame.data[0], expectedByte, `wrong bit for ${flag}`);
    }
  });
});
