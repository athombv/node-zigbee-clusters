'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  currentPositionLiftPercentage: { id: 9, type: ZCLDataTypes.uint8 },
};

const COMMANDS = {
  upOpen: { id: 0 },
  downClose: { id: 1 },
  goToLiftPercentage: {
    id: 5,
    args: {
      percentageLiftValue: ZCLDataTypes.uint8,
    },
  },
};

class WindowCovering extends Cluster {

  static get ID() {
    return 258; // 0x0102
  }

  static get NAME() {
    return 'windowCovering';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(WindowCovering);

module.exports = WindowCovering;
