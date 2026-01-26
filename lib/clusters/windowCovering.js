'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Window Covering Information (0x0000 - 0x000F)
  windowCoveringType: {
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
  physicalClosedLimitLift: { id: 0x0001, type: ZCLDataTypes.uint16 },
  physicalClosedLimitTilt: { id: 0x0002, type: ZCLDataTypes.uint16 },
  currentPositionLift: { id: 0x0003, type: ZCLDataTypes.uint16 },
  currentPositionTilt: { id: 0x0004, type: ZCLDataTypes.uint16 },
  numberofActuationsLift: { id: 0x0005, type: ZCLDataTypes.uint16 },
  numberofActuationsTilt: { id: 0x0006, type: ZCLDataTypes.uint16 },
  configStatus: {
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
  currentPositionLiftPercentage: { id: 0x0008, type: ZCLDataTypes.uint8 },
  currentPositionTiltPercentage: { id: 0x0009, type: ZCLDataTypes.uint8 },

  // Settings (0x0010 - 0x001F)
  installedOpenLimitLift: { id: 0x0010, type: ZCLDataTypes.uint16 },
  installedClosedLimitLift: { id: 0x0011, type: ZCLDataTypes.uint16 },
  installedOpenLimitTilt: { id: 0x0012, type: ZCLDataTypes.uint16 },
  installedClosedLimitTilt: { id: 0x0013, type: ZCLDataTypes.uint16 },
  velocityLift: { id: 0x0014, type: ZCLDataTypes.uint16 },
  accelerationTimeLift: { id: 0x0015, type: ZCLDataTypes.uint16 },
  decelerationTimeLift: { id: 0x0016, type: ZCLDataTypes.uint16 },
  mode: {
    id: 0x0017, // Mandatory
    type: ZCLDataTypes.map8(
      'motorDirectionReversed',
      'calibrationMode',
      'maintenanceMode',
      'ledFeedback',
    ),
  },
  intermediateSetpointsLift: { id: 0x0018, type: ZCLDataTypes.octstr },
  intermediateSetpointsTilt: { id: 0x0019, type: ZCLDataTypes.octstr },
};

const COMMANDS = {
  upOpen: { id: 0 },
  downClose: { id: 1 },
  stop: { id: 2 },
  goToLiftValue: {
    id: 4,
    args: {
      liftValue: ZCLDataTypes.uint16,
    },
  },
  goToLiftPercentage: {
    id: 5,
    args: {
      percentageLiftValue: ZCLDataTypes.uint8,
    },
  },
  goToTiltValue: {
    id: 7,
    args: {
      tiltValue: ZCLDataTypes.uint16,
    },
  },
  goToTiltPercentage: {
    id: 8,
    args: {
      percentageTiltValue: ZCLDataTypes.uint8,
    },
  },
};

class WindowCovering extends Cluster {

  static get ID() {
    return 258; // 0x0102
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
