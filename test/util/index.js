'use strict';

let { debug } = require('../../lib/util');

debug = debug.extend('test');

const Node = require('../../lib/Node');

const debugUtil = debug.extend('util');

const loopbackNode = config => {
  const remotenode = {
    sendFrame: (...args) => remotenode.handleFrame(...args),
    bind: debugUtil.bind(debugUtil, 'binding: ep %d, cluster %d '),
    endpointDescriptors: config,
  };
  return new Node(remotenode);
};

module.exports = {
  debug,
  loopbackNode,
};
