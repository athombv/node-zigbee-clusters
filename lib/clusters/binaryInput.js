'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
};

const COMMANDS = {};

class BinaryInputCluster extends Cluster {

  static get ID() {
    return 15;
  }

  static get NAME() {
    return 'binaryInput';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(BinaryInputCluster);

module.exports = BinaryInputCluster;
