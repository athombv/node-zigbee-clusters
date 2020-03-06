'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  batteryVoltage: { id: 32, type: ZCLDataTypes.uint8 },
  batteryPercentageRemaining: { id: 33, type: ZCLDataTypes.uint8 },
};

const COMMANDS = {};

class PowerConfigurationCluster extends Cluster {

  static get ID() {
    return 1;
  }

  static get NAME() {
    return 'powerConfiguration';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(PowerConfigurationCluster);

module.exports = PowerConfigurationCluster;
