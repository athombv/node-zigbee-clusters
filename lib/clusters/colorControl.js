'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Mandatory if colorCapabilities = hueAndSaturation
  // Reportable, read-only
  currentHue: { id: 0, type: ZCLDataTypes.uint8 },

  // Mandatory if colorCapabilities = hueAndSaturation
  // Reportable, read-only, scene extension
  currentSaturation: { id: 1, type: ZCLDataTypes.uint8 },

  // Mandatory if colorCapabilities = xy
  // Reportable, read-only, scene extension
  currentX: { id: 3, type: ZCLDataTypes.uint16 },

  // Mandatory if colorCapabilities = xy
  // Reportable, read-only, scene extension
  currentY: { id: 4, type: ZCLDataTypes.uint16 },

  // Mandatory if colorCapabilities = colorTemperature
  // Reportable, read-only, scene extension
  colorTemperatureMireds: { id: 7, type: ZCLDataTypes.uint16 },

  // Mandatory, read-only
  colorMode: {
    id: 8,
    type: ZCLDataTypes.enum8({
      currentHueAndCurrentSaturation: 0,
      currentXAndCurrentY: 1,
      colorTemperatureMireds: 2,
    }),
  },

  // Mandatory
  // Read/write
  // Determines the default behavior of some cluster commands, meant to be changed only during
  // commissioning. When executeIfOff is not set, a command is not executed if the On/Off cluster
  // exists on the same endpoint and its onOff attribute is false.
  options: { id: 15, type: ZCLDataTypes.map8('executeIfOff') },

  // Mandatory if colorCapabilities = enhancedHue
  // Read-only, scene extension
  // Represents non-equidistant steps along the CIE 1931 color triangle, providing 16-bits
  // precision. The upper 8 bits are used as an index in the implementation specific XY lookup
  // table, the lower 8 bits interpolate between these steps in a linear way. For compatibility
  // with standard ZCL, currentHue contains a hue value in the range 0 to 254, calculated from
  // this attribute.
  enhancedCurrentHue: { id: 16384, type: ZCLDataTypes.uint16 },

  // Mandatory, read-only
  // Specifies which attributes are currently determining the color of the device. Note that for
  // compatibility with standard ZCL, colorMode reports currentHueAndCurrentSaturation while the
  // device is actually driven by enhancedCurrentHue, so read this attribute instead of colorMode
  // to tell those two apart.
  enhancedColorMode: {
    id: 16385,
    type: ZCLDataTypes.enum8({
      currentHueAndCurrentSaturation: 0,
      currentXAndCurrentY: 1,
      colorTemperatureMireds: 2,
      enhancedCurrentHueAndCurrentSaturation: 3,
    }),
  },

  // Mandatory if colorCapabilities = colorLoop
  // Read-only, scene extension
  // Current active status of the color loop: 0x00 = inactive, 0x01 = active,
  // all other values (0x02 - 0xff) are reserved
  colorLoopActive: { id: 16386, type: ZCLDataTypes.uint8 },

  // Mandatory if colorCapabilities = colorLoop
  // Read-only, scene extension
  // Current direction of the color loop: 0x00 = enhancedCurrentHue is decremented,
  // 0x01 = enhancedCurrentHue is incremented, all other values (0x02 - 0xff) are reserved
  colorLoopDirection: { id: 16387, type: ZCLDataTypes.uint8 },

  // Mandatory if colorCapabilities = colorLoop
  // Read-only, scene extension
  // Number of seconds it takes to perform a full color loop, i.e. to cycle all values of the
  // enhancedCurrentHue attribute (between 0x0000 and 0xffff). Default 0x0019 (25 seconds).
  colorLoopTime: { id: 16388, type: ZCLDataTypes.uint16 },

  // Mandatory if colorCapabilities = colorLoop
  // Read-only
  // Value of enhancedCurrentHue from which the color loop starts. Default 0x2300.
  colorLoopStartEnhancedHue: { id: 16389, type: ZCLDataTypes.uint16 },

  // Mandatory if colorCapabilities = colorLoop
  // Read-only
  // Value of enhancedCurrentHue before the color loop was started. Once the color loop is
  // complete, enhancedCurrentHue is restored to this value.
  colorLoopStoredEnhancedHue: { id: 16390, type: ZCLDataTypes.uint16 },

  // Mandatory, read-only
  // Bit 0: hueAndSaturation mandatory commands: moveToHue, moveHue, stepHue, moveToSaturation,
  // moveSaturation, stepSaturation, moveToHueAndSaturation, stopMoveStep, related attributes:
  // currentHue, currentSaturation

  // Bit 1: enhancedHue (hueAndSaturation must also be supported) mandatory commands:
  // enhancedMoveToHue, enhancedMoveHue, enhancedStepHue, enhancedMoveToHueAndSaturation,
  // stopMoveStep, related attributes: enhancedCurrentHue

  // Bit 2: colorLoop (enhancedHue must also be supported) mandatory commands: colorLoopSet,
  // related attributes: colorLoopActive, colorLoopDirection, colorLoopTime,
  // colorLoopStartEnhancedHue, colorLoopStoredEnhancedHue

  // Bit 3: xy mandatory commands: moveToColor, moveColor, stepColor, stopMoveStep, related
  // attributes: currentX, currentY

  // Bit 4: colorTemperature mandatory commands: moveToColorTemperature, moveColorTemperature,
  // stepColorTemperature, stopMoveStep, related attributes: colorTemperatureMireds,
  // colorTempPhysicalMinMireds, colorTempPhysicalMaxMireds
  colorCapabilities: { id: 16394, type: ZCLDataTypes.map16('hueAndSaturation', 'enhancedHue', 'colorLoop', 'xy', 'colorTemperature') },

  // Mandatory if colorCapabilities = colorTemperature
  // Read-only
  colorTempPhysicalMinMireds: { id: 16395, type: ZCLDataTypes.uint16 },

  // Mandatory if colorCapabilities = colorTemperature
  // Read-only
  colorTempPhysicalMaxMireds: { id: 16396, type: ZCLDataTypes.uint16 },

  // Mandatory if colorTemperatureMireds is supported
  // Read/write, scene extension
  // Startup color temperature, reflected in colorTemperatureMireds on power up
  // (0xffff = restore previous value). On power up colorMode and enhancedColorMode are set to
  // colorTemperatureMireds.
  startUpColorTemperatureMireds: { id: 16400, type: ZCLDataTypes.uint16 },
};

const COMMANDS = {
  moveToHue: {
    id: 0,
    args: {
      hue: ZCLDataTypes.uint8,
      // Direction of travel round the hue circle. shortestDistance is normal usage,
      // longestDistance can be used for rainbow effects. For those two values only, the up
      // direction is taken when both paths are equally long. up and down are explicit.
      direction: ZCLDataTypes.enum8({
        shortestDistance: 0,
        longestDistance: 1,
        up: 2,
        down: 3,
      }),
      // In 1/10ths of a second
      transitionTime: ZCLDataTypes.uint16,
    },
  },
  moveToSaturation: {
    id: 3,
    args: {
      saturation: ZCLDataTypes.uint8,
      // In 1/10ths of a second
      transitionTime: ZCLDataTypes.uint16,
    },
  },
  moveToHueAndSaturation: {
    id: 6,
    args: {
      hue: ZCLDataTypes.uint8,
      saturation: ZCLDataTypes.uint8,
      // In 1/10ths of a second
      transitionTime: ZCLDataTypes.uint16,
    },
  },
  moveToColor: {
    id: 7,
    args: {
      colorX: ZCLDataTypes.uint16,
      colorY: ZCLDataTypes.uint16,
      // In 1/10ths of a second
      transitionTime: ZCLDataTypes.uint16,
    },
  },
  moveToColorTemperature: {
    id: 10,
    args: {
      colorTemperature: ZCLDataTypes.uint16,
      // In 1/10ths of a second
      transitionTime: ZCLDataTypes.uint16,
    },
  },

  // Mandatory if colorCapabilities = colorLoop
  // Activates a color loop such that the color lamp cycles through its range of hues
  colorLoopSet: {
    id: 68, // 0x44
    args: {
      // Specifies which color loop attributes to update before the color loop is started. The
      // action, direction, time and startHue fields below are ignored by the device unless their
      // flag is set here.
      updateFlags: ZCLDataTypes.map8(
        'updateAction', 'updateDirection', 'updateTime', 'updateStartHue',
      ),

      // Action to take for the color loop, only applied when updateFlags.updateAction is set
      action: ZCLDataTypes.enum8({
        deactivate: 0,
        activateFromColorLoopStartEnhancedHue: 1,
        activateFromEnhancedCurrentHue: 2,
      }),

      // Direction for the color loop, written to colorLoopDirection when
      // updateFlags.updateDirection is set
      direction: ZCLDataTypes.enum8({
        decrementHue: 0,
        incrementHue: 1,
      }),

      // Number of seconds over which to perform a full color loop, written to colorLoopTime when
      // updateFlags.updateTime is set
      time: ZCLDataTypes.uint16,

      // Starting hue to use for the color loop, written to colorLoopStartEnhancedHue when
      // updateFlags.updateStartHue is set
      startHue: ZCLDataTypes.uint16,
    },
  },
};

class ColorControlCluster extends Cluster {

  static get ID() {
    return 768; // 0x0300
  }

  static get NAME() {
    return 'colorControl';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(ColorControlCluster);

module.exports = ColorControlCluster;
