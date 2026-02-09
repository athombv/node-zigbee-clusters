'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Window Covering Information (0x0000 - 0x000F)
  windowCoveringType: { // Mandatory
    id: 0x0000,
    type: ZCLDataTypes.enum8({
      rollershade: 0,
      rollershade2Motor: 1,
      rollershadeExterior: 2,
      rollershadeExterior2Motor: 3,
      drapery: 4,
      awning: 5,
      shutter: 6,
      tiltBlindTiltOnly: 7,
      tiltBlindLiftAndTilt: 8,
      projectorScreen: 9,
    }),
  },
  physicalClosedLimitLift: { id: 0x0001, type: ZCLDataTypes.uint16 }, // Optional
  physicalClosedLimitTilt: { id: 0x0002, type: ZCLDataTypes.uint16 }, // Optional
  currentPositionLift: { id: 0x0003, type: ZCLDataTypes.uint16 }, // Optional
  currentPositionTilt: { id: 0x0004, type: ZCLDataTypes.uint16 }, // Optional
  numberofActuationsLift: { id: 0x0005, type: ZCLDataTypes.uint16 }, // Optional
  numberofActuationsTilt: { id: 0x0006, type: ZCLDataTypes.uint16 }, // Optional
  configStatus: { // Mandatory
    id: 0x0007,
    type: ZCLDataTypes.map8(
      'operational',
      'online',
      'reversalLiftCommands',
      'controlLift',
      'controlTilt',
      'encoderLift',
      'encoderTilt',
      'reserved',
    ),
  },
  currentPositionLiftPercentage: { id: 0x0008, type: ZCLDataTypes.uint8 }, // Optional
  currentPositionTiltPercentage: { id: 0x0009, type: ZCLDataTypes.uint8 }, // Optional

  // Settings (0x0010 - 0x001F)
  installedOpenLimitLift: { id: 0x0010, type: ZCLDataTypes.uint16 }, // 16, Conditional¹
  installedClosedLimitLift: { id: 0x0011, type: ZCLDataTypes.uint16 }, // 17, Conditional¹
  installedOpenLimitTilt: { id: 0x0012, type: ZCLDataTypes.uint16 }, // 18, Conditional¹
  installedClosedLimitTilt: { id: 0x0013, type: ZCLDataTypes.uint16 }, // 19, Conditional¹
  // ¹ Closed Loop control and Lift/Tilt actions supported
  velocityLift: { id: 0x0014, type: ZCLDataTypes.uint16 }, // 20, Optional
  accelerationTimeLift: { id: 0x0015, type: ZCLDataTypes.uint16 }, // 21, Optional
  decelerationTimeLift: { id: 0x0016, type: ZCLDataTypes.uint16 }, // 22, Optional
  mode: { // Mandatory
    id: 0x0017, // 23
    type: ZCLDataTypes.map8(
      'motorDirectionReversed',
      'calibrationMode',
      'maintenanceMode',
      'ledFeedback',
    ),
  },
  intermediateSetpointsLift: { id: 0x0018, type: ZCLDataTypes.octstr }, // 24, Optional
  intermediateSetpointsTilt: { id: 0x0019, type: ZCLDataTypes.octstr }, // 25, Optional
};

const COMMANDS = {
  // --- Client to Server Commands ---
  upOpen: { id: 0x0000 }, // Mandatory
  downClose: { id: 0x0001 }, // Mandatory
  stop: { id: 0x0002 }, // Mandatory
  goToLiftValue: { // Optional
    id: 0x0004,
    args: {
      liftValue: ZCLDataTypes.uint16,
    },
  },
  goToLiftPercentage: { // Optional
    id: 0x0005,
    args: {
      percentageLiftValue: ZCLDataTypes.uint8,
    },
  },
  goToTiltValue: { // Optional
    id: 0x0007,
    args: {
      tiltValue: ZCLDataTypes.uint16,
    },
  },
  goToTiltPercentage: { // Optional
    id: 0x0008,
    args: {
      percentageTiltValue: ZCLDataTypes.uint8,
    },
  },
};

class WindowCovering extends Cluster {

  static get ID() {
    return 0x0102; // 258
  }

  static get NAME() {
    return 'windowCovering';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(WindowCovering);

module.exports = WindowCovering;
