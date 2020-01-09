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

const EventEmitter = require('events');
const Endpoint = require('./Endpoint');

class Node extends EventEmitter {
    constructor(node) {
        super();

        // From ZigBeeNode to ZCLNode
        node.handleFrame = this.handleFrame.bind(this);

        // From ZCLNode to ZigBeeNode
        this.sendFrame = async (...args) => {
            return node.sendFrame(...args);
        };

        this.endpoints = {};
        node.endpointDescriptors.forEach(ep => {
            this.endpoints[ep.endpointId] = new Endpoint(this, ep);
        });
    }

    async handleFrame(endpointId, clusterId, frame, meta) {
        if (this.endpoints[endpointId]) {
            return this.endpoints[endpointId].handleFrame(clusterId, frame, meta);
        } else {
            console.log('unhandledFrame', {endpointId, clusterId, frame, meta});
            this.emit('unhandledFrame', {endpointId, clusterId, frame, meta});
        }
    }
}

module.exports = Node;