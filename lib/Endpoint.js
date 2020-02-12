const EventEmitter = require('events');
const Cluster = require('./Cluster');
const BoundCluster = require('./BoundCluster');

const {ZCLStandardHeader, ZCLMfgSpecificHeader} = require('./zclFrames');

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

    _makeErrorResponse(frame) {
        let result;
        if(frame instanceof ZCLStandardHeader) {
            result = new ZCLStandardHeader();
        } else {
            result = new ZCLMfgSpecificHeader();
            result.manufacturerId = frame.manufacturerId;
        }
        //TODO: flip proper bits
        result.frameControl = frame.frameControl.copy();

        result.frameControl.disableDefaultResponse = true;
        result.frameControl.clusterSpecific = false;
        result.frameControl.directionToClient = !frame.frameControl.directionToClient;

        result.trxSequenceNumber = frame.trxSequenceNumber;
        result.cmdId = 0x0B;
        result.data = Buffer.from([frame.cmdId, 0x01]);
        return result;
    }

    async handleFrame(clusterId, frame, meta) {
        const rawFrame = frame;

        if(rawFrame[0] & 0x4)
            frame = ZCLMfgSpecificHeader.fromBuffer(rawFrame);
        else
            frame = ZCLStandardHeader.fromBuffer(rawFrame);

        let response = (frame.frameControl.disableDefaultResponse || (meta && meta.groupId)) ? null : this._makeErrorResponse(frame);

        try {
            const result = await this.handleZCLFrame(clusterId, frame, meta, rawFrame);
            if(!response) return;
            if(result) {
                const [cmdId, data] = result;
                response.data = data.toBuffer();
                response.cmdId = cmdId;
            } else {
                //Set status to success
                response.data[1] = 0;
            }
        } catch(e) {
            console.log('error while handling frame', e.message, {endpointId: this._endpointId, clusterId, meta, frame});
        }
        if(response) {
            this.sendFrame(clusterId, response.toBuffer());
        }
    }

    async handleZCLFrame(clusterId, frame, meta, rawFrame) {
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