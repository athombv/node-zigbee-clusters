'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {};

class MultistateOutputCluster extends Cluster {

  static get ID() {
    return 19;
  }

  static get NAME() {
    return 'multistateOutput';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(MultistateOutputCluster);

module.exports = MultistateOutputCluster;
