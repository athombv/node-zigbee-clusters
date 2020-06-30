'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class AnalogOutputCluster extends Cluster {

  static get ID() {
    return 13;
  }

  static get NAME() {
    return 'analogOutput';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(AnalogOutputCluster);

module.exports = AnalogOutputCluster;
