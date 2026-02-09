'use strict';

let { debug } = require('../../lib/util');

debug = debug.extend('test');

const {
  createMockNode,
  createConnectedNodePair,
  createBoundClusterWithAttributes,
  MOCK_DEVICES,
} = require('./mockNode');

module.exports = {
  debug,
  // Mock node utilities
  createMockNode,
  createConnectedNodePair,
  createBoundClusterWithAttributes,
  MOCK_DEVICES,
};
