'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  unitofMeasure: { id: 0, type: ZCLDataTypes.uint24 },
  multiplier: { id: 1, type: ZCLDataTypes.uint24 },
  divisor: { id: 2, type: ZCLDataTypes.uint24 },
};

const COMMANDS = {};

class MeteringCluster extends Cluster {

  static get ID() {
    return 1794; // 0x0702
  }

  static get NAME() {
    return 'metering';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(MeteringCluster);

module.exports = MeteringCluster;
