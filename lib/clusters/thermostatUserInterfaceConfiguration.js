'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  temperatureDisplayMode: {
    id: 0,
    type: ZCLDataTypes.enum8({
      celsius: 0,
      fahrenheit: 1,
    }),
  },
  keypadLockout: {
    id: 1,
    type: ZCLDataTypes.enum8({
      none: 0,
      level1: 1,
      level2: 2,
      level3: 3,
      level4: 4,
      level5: 5,
    }),
  },
  scheduleProgrammingVisibility: {
    id: 2,
    type: ZCLDataTypes.enum8({
      enabled: 0,
      disabled: 1,
    }),
  },
};

const COMMANDS = {};

class ThermostatUserInterfaceConfigurationCluster extends Cluster {

  static get ID() {
    return 516;
  }

  static get NAME() {
    return 'thermostatUserInterfaceConfiguration';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(ThermostatUserInterfaceConfigurationCluster);

module.exports = ThermostatUserInterfaceConfigurationCluster;
