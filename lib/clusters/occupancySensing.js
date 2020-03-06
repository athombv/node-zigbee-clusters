'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  occupancy: { id: 0, type: ZCLDataTypes.map8('occupied') }, // TODO: verify this bitmap
};

const COMMANDS = {};

class OccupancySensing extends Cluster {

  static get ID() {
    return 1030; // 0x0406
  }

  static get NAME() {
    return 'occupancySensing';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(OccupancySensing);

module.exports = OccupancySensing;
