'use strict';

const EventEmitter = require('events');

let { debug } = require('./util');
const Endpoint = require('./Endpoint');

debug = debug.extend('node');

// networkAddress: 1234,
// lqi: NaN,
// route: null,
// profileID: null,
// manufacturerID: null,
// deviceId: null,
// url: null,
// swVersion: null,
// endpoints: {
// }

class Node extends EventEmitter {

  constructor(controlledNode) {
    super();

    // From ZigBeeNode to ZCLNode
    controlledNode.handleFrame = this.handleFrame.bind(this);

    // From ZCLNode to ZigBeeNode
    this.sendFrame = async (...args) => {
      return controlledNode.sendFrame(...args);
    };

    this.endpoints = {};
    controlledNode.endpointDescriptors.forEach(ep => {
      this.endpoints[ep.endpointId] = new Endpoint(this, ep);
    });
  }

  async handleFrame(endpointId, clusterId, frame, meta) {
    if (!Buffer.isBuffer(frame)) {
      // eslint-disable-next-line prefer-rest-params
      debug('invalid frame received', arguments, frame);
      return;
    }

    if (this.endpoints[endpointId]) {
      await this.endpoints[endpointId].handleFrame(clusterId, frame, meta);
    } else {
      debug('error while handling frame, endpoint unavailable', {
        endpointId, clusterId, meta, frame,
      });
    }
  }

}

module.exports = Node;
