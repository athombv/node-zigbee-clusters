'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
};

const COMMANDS = {};

class RelativeHumidityCluster extends Cluster {

  static get ID() {
    return 1029;
  }

  static get NAME() {
    return 'relativeHumidity';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(RelativeHumidityCluster);

module.exports = RelativeHumidityCluster;
