'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {};

const COMMANDS = {
  resetAllAlarms: {
    id: 1,
  },
  getAlarm: {
    id: 2,
    response: {
      id: 1,
      encodeMissingFieldsBehavior: 'skip',
      args: {
        status: ZCLDataTypes.enum8Status,
        // Remaining fields only present when status is SUCCESS
        alarmCode: ZCLDataTypes.uint8,
        clusterId: ZCLDataTypes.uint16,
        timeStamp: ZCLDataTypes.uint32,
      },
    },
  },
  resetAlarmLog: {
    id: 3,
  },
};

class AlarmsCluster extends Cluster {
  static get ID() {
    return 9; // 0x9
  }

  static get NAME() {
    return 'alarms';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }
}

Cluster.addCluster(AlarmsCluster);

module.exports = AlarmsCluster;
