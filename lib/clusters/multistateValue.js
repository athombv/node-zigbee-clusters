'use strict';

const Cluster = require('../Cluster');

const ATTRIBUTES = {
};

const COMMANDS = {};

class MultistateValueCluster extends Cluster {

  static get ID() {
    return 20;
  }

  static get NAME() {
    return 'multistateValue';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(MultistateValueCluster);

module.exports = MultistateValueCluster;
