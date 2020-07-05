'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  measuredValue: { id: 0, type: ZCLDataTypes.uint16 },
  minMeasuredValue: { id: 1, type: ZCLDataTypes.uint16 },
  maxMeasuredValue: { id: 2, type: ZCLDataTypes.uint16 },
  tolerance: { id: 3, type: ZCLDataTypes.uint16 },
  lightSensorType: { id: 3, type: ZCLDataTypes.enum8({
    photodiode: 0,  // 0x00 Photodiode
    cmos: 1,        // 0x01 CMOS
                    // 0x40 – 0xfe Reserved for manufacturer specific light sensor types
    unknown: 255,   // 0xff Unknown
  }) },
};

const COMMANDS = {};

class IlluminanceMeasurementCluster extends Cluster {

  static get ID() {
    return 1024; // 0x0400
  }

  static get NAME() {
    return 'illuminanceMeasurement';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(IlluminanceMeasurementCluster);

module.exports = IlluminanceMeasurementCluster;
