'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
};

const COMMANDS = {};

class FlowMeasurementCluster extends Cluster {

  static get ID() {
    return 1028;
  }

  static get NAME() {
    return 'flowMeasurement';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(FlowMeasurementCluster);

module.exports = FlowMeasurementCluster;
