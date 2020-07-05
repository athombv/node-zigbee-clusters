'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  description: { id: 28, type: ZCLDataTypes.string },
  outOfService: { id: 81, type: ZCLDataTypes.bool },
  presentValue: { id: 85, type: ZCLDataTypes.single },
  reliability: { id: 103, type: ZCLDataTypes.enum8({
    noFaultDetected: 0,     // NO-FAULT-DETECTED (0)
    // noSensor: 1,            // NO-SENSOR (1) - for input clusters only
    overRange: 2,           // OVER-RANGE (2)
    underRange: 3,          // UNDER-RANGE (3)
    openLoop: 4,            // OPEN-LOOP (4)
    shortedLoop: 5,         // SHORTED-LOOP (5)
    // noOutput: 6,            // NO-OUTPUT (6) - for input clusters only
    unreliableOther: 7,     // UNRELIABLE-OTHER (7)
    processError: 8,        // PROCESS-ERROR (8)
    // multiStateFault: 9,   // MULTI-STATE-FAULT (9) - for multistate clusters only
    configurationError: 10  // CONFIGURATION-ERROR (10)
    })
  },
  relinquishDefault: { id: 104, type: ZCLDataTypes.bool },
  statusFlags: { id: 111, type: ZCLDataTypes.map8('inAlarm', 'fault', 'overridden', 'outOfService') },
  applicationType: { id: 256, type: ZCLDataTypes.uint32 },
};

const COMMANDS = {};

class AnalogValueCluster extends Cluster {

  static get ID() {
    return 14;
  }

  static get NAME() {
    return 'analogValue';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(AnalogValueCluster);

module.exports = AnalogValueCluster;
