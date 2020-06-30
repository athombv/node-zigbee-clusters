'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
};

const COMMANDS = {};

class BinaryValueCluster extends Cluster {

  static get ID() {
    return 17;
  }

  static get NAME() {
    return 'binaryValue';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(BinaryValueCluster);

module.exports = BinaryValueCluster;
