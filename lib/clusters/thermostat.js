'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class ThermostatCluster extends Cluster {

  static get ID() {
    return 513;
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

Cluster.addCluster(ThermostatCluster);

module.exports = ThermostatCluster;
