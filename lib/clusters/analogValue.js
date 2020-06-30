'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
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
