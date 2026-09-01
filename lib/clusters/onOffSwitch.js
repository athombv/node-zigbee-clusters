'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  switchType: {
    id: 0x0000,
    type: ZCLDataTypes.enum8({
      toggle: 0x00,
      momentary: 0x01,
      multifunction: 0x02,
    }),
  },
  switchActions: {
    id: 0x0010,
    type: ZCLDataTypes.enum8({
      onOff: 0x00,
      offOn: 0x01,
      toggle: 0x02,
    }),
  },
};

const COMMANDS = {};

class OnOffSwitchCluster extends Cluster {

  static get ID() {
    return 7;
  }

  static get NAME() {
    return 'onOffSwitch';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(OnOffSwitchCluster);

module.exports = OnOffSwitchCluster;
