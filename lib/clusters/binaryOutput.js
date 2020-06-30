'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class BinaryOutputCluster extends Cluster {

  static get ID() {
    return 16;
  }

  static get NAME() {
    return 'binaryOutput';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(BinaryOutputCluster);

module.exports = BinaryOutputCluster;
