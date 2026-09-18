'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  switchType: { id: 0, type: ZCLDataTypes.enum8({ toggle: 0, momentary: 1, multifunction: 2 }) },
  switchActions: { id: 16, type: ZCLDataTypes.enum8({ onOff: 0, offOn: 1, toggle: 2 }) },
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
