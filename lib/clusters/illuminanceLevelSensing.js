'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class IlluminanceLevelSensingCluster extends Cluster {

  static get ID() {
    return 1025;
  }

  static get NAME() {
    return 'illuminanceLevelSensing';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(IlluminanceLevelSensingCluster);

module.exports = IlluminanceLevelSensingCluster;
