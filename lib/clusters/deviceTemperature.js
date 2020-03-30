'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {};

const COMMANDS = {};

class DeviceTemperatureCluster extends Cluster {

  static get ID() {
    return 2;
  }

  static get NAME() {
    return 'deviceTemperature';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(DeviceTemperatureCluster);

module.exports = DeviceTemperatureCluster;
