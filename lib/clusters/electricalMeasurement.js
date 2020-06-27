'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  instantaneousDemand: { id: 0, type: ZCLDataTypes.uint24 },
  rmsVoltage: { id: 1285, type: ZCLDataTypes.uint16 },
  rmsCurrent: { id: 1288, type: ZCLDataTypes.uint16 },
  activePower: { id: 1291, type: ZCLDataTypes.uint16 },
  acVoltageMultiplier: { id: 1536, type: ZCLDataTypes.uint16 },
  acVoltageDivisor: { id: 1537, type: ZCLDataTypes.uint16 },
  acCurrentMultiplier: { id: 1538, type: ZCLDataTypes.uint16 },
  acCurrentDivisor: { id: 1539, type: ZCLDataTypes.uint16 },
  acPowerMultiplier: { id: 1540, type: ZCLDataTypes.uint16 },
  acPowerDivisor: { id: 1541, type: ZCLDataTypes.uint16 },
  acAlarmsMask: { id: 2048, type: ZCLDataTypes.map16 },
  acVoltageOverload: { id: 2049, type: ZCLDataTypes.uint16 },
  acCurrentOverload: { id: 2050, type: ZCLDataTypes.uint16 },
  acActivePowerOverload: { id: 2051, type: ZCLDataTypes.uint16 },
};

const COMMANDS = {};

class ElectricalMeasurement extends Cluster {

  static get ID() {
    return 2820; // 0x0b04
  }

  static get NAME() {
    return 'electricalMeasurement';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(ElectricalMeasurement);

module.exports = ElectricalMeasurement;
