'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
};

const COMMANDS = {};

class PressureMeasurementCluster extends Cluster {

  static get ID() {
    return 1027;
  }

  static get NAME() {
    return 'pressureMeasurement';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(PressureMeasurementCluster);

module.exports = PressureMeasurementCluster;
