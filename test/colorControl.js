'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

const BoundCluster = require('../lib/BoundCluster');
const ColorControlCluster = require('../lib/clusters/colorControl');
const { createVirtualDevice } = require('./util/virtualDevice');

// Sends a color command on a fresh node and returns the parsed outgoing frame, so tests can assert
// the payload bytes against the ZCL spec instead of round-tripping through our own definition
async function sendColorCommand(commandName, args) {
  const { zclNode, virtualDevice, frames } = createVirtualDevice({
    endpoints: [
      {
        endpointId: 1,
        inputClusters: [ColorControlCluster.ID],
      },
    ],
  });

  virtualDevice.endpoints[1].bind(
    'colorControl',
    new (class extends BoundCluster {
      async [commandName]() {
        // Accept the command so no error response is generated
      }
    })(),
  );

  await zclNode.endpoints[1].clusters.colorControl[commandName](args);

  assert.strictEqual(frames[0].from, 'zclNode');
  return frames[0].frame;
}

describe('Color Control', function () {
  it('should receive moveToColor', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [ColorControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'colorControl',
      new (class extends BoundCluster {
        async moveToColor(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.colorControl.moveToColor({
      colorX: 0x5000,
      colorY: 0x3000,
      transitionTime: 20,
    });

    assert.strictEqual(receivedData.colorX, 0x5000);
    assert.strictEqual(receivedData.colorY, 0x3000);
    assert.strictEqual(receivedData.transitionTime, 20);
  });

  it('should receive moveToColorTemperature', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [ColorControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'colorControl',
      new (class extends BoundCluster {
        async moveToColorTemperature(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.colorControl.moveToColorTemperature({
      colorTemperature: 370,
      transitionTime: 15,
    });

    assert.strictEqual(receivedData.colorTemperature, 370);
    assert.strictEqual(receivedData.transitionTime, 15);
  });

  it('should receive moveToHueAndSaturation', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [ColorControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'colorControl',
      new (class extends BoundCluster {
        async moveToHueAndSaturation(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.colorControl.moveToHueAndSaturation({
      hue: 180,
      saturation: 200,
      transitionTime: 10,
    });

    assert.strictEqual(receivedData.hue, 180);
    assert.strictEqual(receivedData.saturation, 200);
    assert.strictEqual(receivedData.transitionTime, 10);
  });

  it('should receive colorLoopSet', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [ColorControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'colorControl',
      new (class extends BoundCluster {
        async colorLoopSet(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.colorControl.colorLoopSet({
      updateFlags: ['updateAction', 'updateDirection', 'updateTime', 'updateStartHue'],
      action: 'activateFromColorLoopStartEnhancedHue',
      direction: 'incrementHue',
      time: 30,
      startHue: 0x2300,
    });

    assert.deepStrictEqual(receivedData.updateFlags.getBits(), [
      'updateAction',
      'updateDirection',
      'updateTime',
      'updateStartHue',
    ]);
    assert.strictEqual(receivedData.action, 'activateFromColorLoopStartEnhancedHue');
    assert.strictEqual(receivedData.direction, 'incrementHue');
    assert.strictEqual(receivedData.time, 30);
    assert.strictEqual(receivedData.startHue, 0x2300);
  });

  // The round-trip test above encodes and decodes with the same definition, so it passes even when
  // that definition is wrong on the wire. These bytes come from the spec, not from our types:
  // ZCL r8 Figure 5-17 (payload layout), Figure 5-18 (updateFlags bits), Table 5.25 (action
  // values), Table 5.26 (direction values), Table 5.13 (command id).
  it('should encode colorLoopSet as specified by the ZCL', async function () {
    const frame = await sendColorCommand('colorLoopSet', {
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
  it('should encode each colorLoopSet update flag on its own bit', async function () {
    const flagBits = [
      ['updateAction', 0x01],
      ['updateDirection', 0x02],
      ['updateTime', 0x04],
      ['updateStartHue', 0x08],
    ];

    for (const [flag, expectedByte] of flagBits) {
      const frame = await sendColorCommand('colorLoopSet', {
        updateFlags: [flag],
        action: 'deactivate',
        direction: 'decrementHue',
        time: 0,
        startHue: 0,
      });

      assert.strictEqual(frame.data[0], expectedByte, `wrong bit for ${flag}`);
    }
  });

  // ZCL r8 Figure 5-12: Color Temperature Mireds (uint16), Transition Time (uint16), OptionsMask
  // (map8), OptionsOverride (map8); 5.2.2.3.3: missing fields are interpreted for legacy devices
  it('should encode moveToColorTemperature without options as before', async function () {
    const frame = await sendColorCommand('moveToColorTemperature', {
      colorTemperature: 0x011e, // 286, uint16 little endian, so 1e 01
      transitionTime: 15, // 0f 00
    });

    assert.strictEqual(frame.cmdId, 0x0a);
    assert.deepStrictEqual(frame.data, Buffer.from([0x1e, 0x01, 0x0f, 0x00]));
  });

  it('should encode moveToColorTemperature with options as specified by the ZCL', async function () {
    const frame = await sendColorCommand('moveToColorTemperature', {
      colorTemperature: 0x011e,
      transitionTime: 15,
      optionsMask: ['executeIfOff'], // Bit 0, so 0x01
      optionsOverride: ['executeIfOff'],
    });

    assert.strictEqual(frame.cmdId, 0x0a);
    assert.deepStrictEqual(frame.data, Buffer.from([0x1e, 0x01, 0x0f, 0x00, 0x01, 0x01]));
  });

  // ZCL r8 Figure 5-9: Color X, Color Y, Transition Time (uint16), OptionsMask, OptionsOverride
  it('should encode moveToColor with options as specified by the ZCL', async function () {
    const frame = await sendColorCommand('moveToColor', {
      colorX: 0x5000,
      colorY: 0x3000,
      transitionTime: 20,
      optionsMask: ['executeIfOff'],
      optionsOverride: [], // Mask set, override cleared: do not execute when off
    });

    assert.strictEqual(frame.cmdId, 0x07);
    assert.deepStrictEqual(
      frame.data,
      Buffer.from([0x00, 0x50, 0x00, 0x30, 0x14, 0x00, 0x01, 0x00]),
    );
  });

  it('should receive moveToColorTemperature with options', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [ColorControlCluster.ID],
        },
      ],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'colorControl',
      new (class extends BoundCluster {
        async moveToColorTemperature(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.colorControl.moveToColorTemperature({
      colorTemperature: 370,
      transitionTime: 15,
      optionsMask: ['executeIfOff'],
      optionsOverride: ['executeIfOff'],
    });

    assert.strictEqual(receivedData.colorTemperature, 370);
    assert.strictEqual(receivedData.transitionTime, 15);
    assert.deepStrictEqual(receivedData.optionsMask.getBits(), ['executeIfOff']);
    assert.deepStrictEqual(receivedData.optionsOverride.getBits(), ['executeIfOff']);
  });
});
