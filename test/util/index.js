'use strict';

let { debug } = require('../../lib/util');

debug = debug.extend('test');

const {
  createMockNode,
  createConnectedNodePair,
  createBoundClusterWithAttributes,
  MOCK_DEVICES,
} = require('./mockNode');
const { createVirtualDevice, HOMEY_MAX_ZCL_BYTES } = require('./virtualDevice');

module.exports = {
  debug,
  // Mock node utilities
  createMockNode,
  createConnectedNodePair,
  createBoundClusterWithAttributes,
  MOCK_DEVICES,
  createVirtualDevice,
  HOMEY_MAX_ZCL_BYTES,
};
