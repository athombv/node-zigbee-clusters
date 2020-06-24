'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  localTemperature: { id: 0, type: ZCLDataTypes.int16 },
  outdoorTemperature: { id: 1, type: ZCLDataTypes.int16 },
  ocupancy: { id: 2, type: ZCLDataTypes.map8 },
  absMinHeatSetpointLimit: { id: 3, type: ZCLDataTypes.int16 },
  absMaxHeatSetpointLimit: { id: 4, type: ZCLDataTypes.int16 },
  absMinCoolSetpointLimit: { id: 5, type: ZCLDataTypes.int16 },
  absMaxCoolSetpointLimit: { id: 6, type: ZCLDataTypes.int16 },
  pICoolingDemand: { id: 7, type: ZCLDataTypes.uint8 },
  pIHeatingDemand: { id: 8, type: ZCLDataTypes.uint8 },
  
  localTemperatureCalibration: { id: 16, type: ZCLDataTypes.int8 },
  occupiedCoolingSetpoint: { id: 17, type: ZCLDataTypes.int16 },
  occupiedHeatingSetpoint: { id: 18, type: ZCLDataTypes.int16 },
  unoccupiedCoolingSetpoint: { id: 19, type: ZCLDataTypes.int16 },
  unoccupiedHeatingSetpoint: { id: 20, type: ZCLDataTypes.int16 },
  minHeatSetpointLimit: { id: 21, type: ZCLDataTypes.int16 },
  maxHeatSetpointLimit: { id: 22, type: ZCLDataTypes.int16 },
  minCoolSetpointLimit: { id: 23, type: ZCLDataTypes.int16 },
  maxCoolSetpointLimit: { id: 24, type: ZCLDataTypes.int16 },
  minSetpointDeadBand: { id: 25, type: ZCLDataTypes.int8 },
  remoteSensing: { id: 26, type: ZCLDataTypes.map8 },
  controlSequenceOfOperation: { id: 27, type: ZCLDataTypes.enum8 },
  systemMode: { id: 28, type: ZCLDataTypes.enum8 },
  alarmMask: { id: 29, type: ZCLDataTypes.map8 },
};

const COMMANDS = {
  setSetpoint: {
    id: 0,
    args: {
      mode: ZCLDataTypes.enum8,
      amount: ZCLDataTypes.int8,
    },
  },
};

class Thermostat extends Cluster {

  static get ID() {
    return 513; // 
  }

  static get NAME() {
    return 'thermostat';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }
}

Cluster.addCluster(TemperatureMeasurement);
module.exports = TemperatureMeasurement;
