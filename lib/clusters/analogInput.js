'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class AnalogInputCluster extends Cluster {

  static get ID() {
    return 12; // 0x0c
  }

  static get NAME() {
    return 'analogInput';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(AnalogInputCluster);

module.exports = AnalogInputCluster;
