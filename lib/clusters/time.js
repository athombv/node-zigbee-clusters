'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  time: { id: 0, type: ZCLDataTypes.UTC },
  timeStatus: { id: 1, type: ZCLDataTypes.map8('master', 'synchronized', 'masterZoneDst', 'superseding') },
  timeZone: { id: 2, type: ZCLDataTypes.int32 },
  dstStart: { id: 3, type: ZCLDataTypes.uint32 },
  dstEnd: { id: 4, type: ZCLDataTypes.uint32 },
  dstShift: { id: 5, type: ZCLDataTypes.int32 },
  standardTime: { id: 6, type: ZCLDataTypes.uint32 },
  localTime: { id: 7, type: ZCLDataTypes.uint32 },
  lastSetTime: { id: 8, type: ZCLDataTypes.UTC },
  validUntilTime: { id: 9, type: ZCLDataTypes.UTC },
};

const COMMANDS = {};

class TimeCluster extends Cluster {

  static get ID() {
    return 10; // 0xA
  }

  static get NAME() {
    return 'time';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(TimeCluster);

module.exports = TimeCluster;
