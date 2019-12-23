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
    constructor(remoteNode) {
        super();

        // Check if remote node is provided
        if (!remoteNode) throw new Error('expected_remote_node');
        if (!Object.prototype.hasOwnProperty.call(remoteNode, 'endpointDescriptors')) {
            throw new Error('expected_remote_node_with_endpoint_descriptors');
        }
        this._remoteNode = remoteNode;

        // Forward event from remoteNode to ZCLNode
        this._remoteNode.on('endDeviceAnnounce', this.emit.bind(this, 'endDeviceAnnounce'));

        this._remoteNode.handleFrame = this.handleFrame.bind(this);

        this.endpoints = {};
        this._remoteNode.endpointDescriptors.forEach(ep => {
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

    async sendFrame(endpointId, clusterId, frame) {
        return this._remoteNode.sendFrame(endpointId, clusterId, frame);
    }
}

module.exports = Node;