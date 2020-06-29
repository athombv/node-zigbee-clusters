'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class BallastConfigurationCluster extends Cluster {

  static get ID() {
    return 769;
  }

  static get NAME() {
    return 'ballastConfiguration';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(BallastConfigurationCluster);

module.exports = BallastConfigurationCluster;
