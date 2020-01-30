// inputClusters: {
//     basicDevice: {
//     }
// },
// outputClusters: {
// }

const EventEmitter = require('events');
const Cluster = require('./Cluster');
const BoundCluster = require('./BoundCluster');

class Endpoint extends EventEmitter {
    constructor(node, descriptor) {
        super();
        this.clusters = {};
        this.bindings = {};
        this._node = node;
        this._descriptor = descriptor;
        this._endpointId = descriptor.endpointId;

        descriptor.inputClusters.forEach(cId => {
            const InputCluster = Cluster.getCluster(cId);
            if(InputCluster)
                this.clusters[InputCluster.NAME] = new InputCluster(this);
        });
    }

    async handleFrame(clusterId, frame, meta, rawFrame) {
        const ClusterClass = Cluster.getCluster(clusterId);
        const clusterName = ClusterClass ? ClusterClass.NAME : clusterId;

        let response;
        if(!frame.frameControl.directionToClient) {
            if(this.bindings[clusterName]) {
                response = await this.bindings[clusterName].handleFrame(frame, meta, rawFrame);
            } else {
                throw new Error('binding_unavailable');
            }
        } else {
            if(this.clusters[clusterName]) {
                response = await this.clusters[clusterName].handleFrame(frame, meta, rawFrame);
            } else {
                throw new Error('cluster_unavailable');
            }
        }

        return response;
    }

    async sendFrame(clusterId, data) {
        return this._node.sendFrame(this._endpointId, clusterId, data);
    }

    async bind(clusterName, clusterImpl) {

        const OutputCluster = Cluster.getCluster(clusterName);
        if(!OutputCluster) {
            throw new TypeError(clusterName+' is not a valid cluster');
        }

        if(!(clusterImpl instanceof BoundCluster)) {
            throw new TypeError('Binding implementation must be an instance of BoundCluster');
        }

        clusterImpl.endpoint = this._endpointIdendpoint;
        clusterImpl.cluster = OutputCluster;

        this.bindings[OutputCluster.NAME] = clusterImpl;
    }

    async unbind(clusterName) {
        const OutputCluster = Cluster.getCluster(clusterName);
        this.bindings[OutputCluster.NAME] = new OutputCluster(this, OutputCluster);
    }
}

module.exports = Endpoint;