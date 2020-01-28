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
const {ZCLStandardHeader, ZCLMfgSpecificHeader} = require('./zclFrames');

class Node extends EventEmitter {
    constructor(controlledNode) {
        super();

        // From ZigBeeNode to ZCLNode
        controlledNode.handleFrame = this.handleFrame.bind(this);

        // From ZCLNode to ZigBeeNode
        this.sendFrame = async (...args) => {
            return controlledNode.sendFrame(...args);
        };

        this.bind = async (...args) => {
            return controlledNode.bind(...args);
        }

        this.endpoints = {};
        controlledNode.endpointDescriptors.forEach(ep => {
            this.endpoints[ep.endpointId] = new Endpoint(this, ep);
        });
    }

    _makeErrorResponse(endpointId, clusterId, frame) {
        let result;
        if(frame instanceof ZCLStandardHeader) {
            result = new ZCLStandardHeader();
        } else {
            result = new ZCLMfgSpecificHeader();
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

    async handleFrame(endpointId, clusterId, frame, meta) {
        const rawFrame = frame;
        if(!Buffer.isBuffer(frame)) {
            console.log(arguments, frame);
        }
        if(rawFrame[0] & 0x4)
            frame = ZCLMfgSpecificHeader.fromBuffer(rawFrame);
        else
            frame = ZCLStandardHeader.fromBuffer(rawFrame);

        let response = frame.frameControl.disableDefaultResponse ? null : this._makeErrorResponse(endpointId, clusterId, frame);

        try {
            if (this.endpoints[endpointId]) {
                const result = await this.endpoints[endpointId].handleFrame(clusterId, frame, meta, rawFrame);
                if(!response) return;
                if(result) {
                    const [cmdId, data] = result;
                    response.data = data.toBuffer();
                    response.cmdId = cmdId;
                } else {
                    //Set status to success
                    response.data[1] = 0;
                }
            } else {
                console.log('unhandledFrame', {endpointId, clusterId, frame, meta, rawFrame});
                throw new Error('endpoint_unavailable');
            }
        } catch(e) {
            console.log('error while handling frame', e, {endpointId, clusterId, frame, meta, rawFrame});
        }
        if(response) {
            this.sendFrame(endpointId, clusterId, response.toBuffer());
        }
    }
}

module.exports = Node;