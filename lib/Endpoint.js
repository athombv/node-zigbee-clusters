// inputClusters: {
//     basicDevice: {
//     }
// },
// outputClusters: {
// }

const EventEmitter = require('events');
const {ZCLStandardHeader, ZCLMfgSpecificHeader} = require('./zclFrames');
const Cluster = require('./Cluster');

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
        descriptor.outputClusters.forEach(cId => {
            const OutputCluster = Cluster.getCluster(cId);
            if(OutputCluster)
                this.bindings[OutputCluster.NAME] = new OutputCluster(this);
        });
    }

    async handleFrame(clusterId, frame, meta) {
        const rawFrame = frame;
        if(rawFrame[0] & 0x4)
            frame = ZCLMfgSpecificHeader.fromBuffer(rawFrame);
        else
            frame = ZCLStandardHeader.fromBuffer(rawFrame);

        const ClusterClass = Cluster.getCluster(clusterId);
        const clusterName = ClusterClass ? ClusterClass.NAME : clusterId;

        let response;

        if(!frame.frameControl.directionToClient) {
            if(this.bindings[clusterName])
                response = await this.bindings[clusterName].handleFrame(frame, meta, rawFrame);
            else
                console.log('got unexpected bound clusterId:', clusterId, frame, meta);
        } else {
            if(this.clusters[clusterName])
                response = await this.clusters[clusterName].handleFrame(frame, meta, rawFrame);
            else
                console.log('got unexpected clusterId:', clusterId, frame, meta);
        }
    }

    async sendFrame(clusterId, data) {
        return this._node.sendFrame(this._endpointId, clusterId, data);
    }

    async bind(clusterName, nwkAddr) {

    }

    async unbind(clusterName) {

    }
}

module.exports = Endpoint;