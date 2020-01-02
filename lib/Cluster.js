const EventEmitter = require('events');
const {ZCLStandardHeader, ZCLMfgSpecificHeader, ZCLAttributeDataRecord} = require('./zclFrames');
const {ZCLStruct, ZCLDataTypes} = require('./zclTypes');

const GLOBAL_ATTRIBUTES = {
    clusterRevision             : { id: 0xfffd,      type: ZCLDataTypes.uint16 },
    attributrReportingStatus    : { id: 0xfffe,      type: ZCLDataTypes.enum8({
        PENDING     : 0,
        COMPLETE    : 1,
    }) },
};

const GLOBAL_COMMANDS = {
    readAttributes         : { id: 0x00, args: {
            attributes          : ZCLDataTypes.Array0(ZCLDataTypes.uint16),
        }, response             : { id: 0x01, args: {
                attributes          : ZCLDataTypes.buffer,
        }}, frameControl        : []
    },

    writeAttributes        : { id: 0x02, args: {
            attributes          : ZCLDataTypes.buffer,
        }, response             : { id: 0x05, args: {
            attributes              : ZCLDataTypes.buffer,
        }}, frameControl        : []
    },

    writeAttributesAtomic  : { id: 0x03, args: {
            attributes          : ZCLDataTypes.buffer,
        }, response             : { id: 0x05, args: {
            attributes              : ZCLDataTypes.buffer,
        }}, frameControl        : []
    },

    configureReporting     : { id: 0x06, args: {
            reports             : ZCLDataTypes.Array0(ZCLStruct('ConfigureReportingRequest', {
                direction           : ZCLDataTypes.enum8('receiveReports', 'sendingReports'),
                attributeId         : ZCLDataTypes.uint16,
                attributeType       : ZCLDataTypes.uint16,
                minInterval         : ZCLDataTypes.uint16,
                maxInterval         : ZCLDataTypes.uint16,
                minChange           : ZCLDataTypes.buffer,
            }))
        }, response             : {id: 0x07, args: {
            reports                 : ZCLDataTypes.Array0(ZCLStruct('ConfigureReportingResponse', {
                status                  : ZCLDataTypes.enum8Status,
                direction               : ZCLDataTypes.enum8('receiveReports', 'sendingReports'),
                attributeId             : ZCLDataTypes.uint16,
            }))
        }}, frameControl        : []
    },
};


class Cluster extends EventEmitter {
    constructor(endpoint) {
        super();

        this._endpoint = endpoint;
        this._attributes = {};
        this._nextTrxSeqNr = 0;

        this._attributes = {
            ...GLOBAL_ATTRIBUTES,
            ...this.constructor.ATTRIBUTES
        };

        this._attributesById = Object.entries(this._attributes).reduce((r, [name, a]) => {r[a.id] = {...a, name}; return r}, {});
        this._attributeArrayStatusDataType = ZCLDataTypes.Array0(ZCLAttributeDataRecord(true, this._attributesById));
        this._attributeArrayDataType = ZCLDataTypes.Array0(ZCLAttributeDataRecord(false, this._attributesById));

        this.name = this.constructor.NAME;

        this._handlers = {};
    }

    static get ID() {
        throw new Error('cluster_id_unspecified');
    }

    static get NAME() {
        return new Error('cluster_name_unspecified')
    }

    static get ATTRIBUTES() {
        return {};
    }

    static get COMMANDS() {
        return this.prototype === Cluster.prototype ? GLOBAL_COMMANDS : {};
    }

    nextSeqNr() {
        this._nextTrxSeqNr = (this._nextTrxSeqNr+1)%256;
        return this._nextTrxSeqNr;
    }

    async handleFrame(frame, meta, rawFrame) {
        const handler = this._handlers[frame.trxSequenceNumber];
        delete this._handlers[frame.trxSequenceNumber];
        if(handler) {
            const res = handler(frame, meta, rawFrame);
            return res;
        } else if(!frame.frameControl.clusterSpecific) {
            console.log('TODO: parsing for these commands/reports', frame.cmdId, frame.data);
            switch(frame.cmdId) { // TODO report parsing
                case 10:
                    //report attributes
                    frame.data = this._attributeArrayDataType.fromBuffer(frame.data)
                    console.log(frame.data);
                    frame.data.forEach(a => {
                        this.emit('attr.'+a.name, a.value);
                    });
                default:
            }
        } else {
            console.log(this.constructor.NAME, frame, meta);
        }
    }

    async _awaitPacket(trxSequenceNumber, format, timeout = 25000) {
        if(this._handlers[trxSequenceNumber])
            throw new TypeError('already waiting for this trx: '+trxSequenceNumber);
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('timeout')), timeout);
            this._handlers[trxSequenceNumber] = async (frame) => {
                frame.data = format.fromBuffer(frame.data, 0);
                resolve(frame.data);
            };
        });
    }

    async sendFrame(data) {
        data = {
            frameControl        : ['clusterSpecific'],
            data                : Buffer.alloc(0),
            ...data,
        };

        if(!data.frameControl.includes('manufacturerSpecific')) {
            data = new ZCLStandardHeader(data);
        } else {
            data = new ZCLMfgSpecificHeader(data);
        }

        return this._endpoint.sendFrame(this.constructor.ID, data.toBuffer());
    }

    async readAttributes(...names) {
        if(!names.length) {
            names = Object.keys(this._attributes);
        }
        let mismatch = names.find(n => !this._attributes[n])
        if(mismatch)
            throw new TypeError(mismatch+' is not a valid attribute of '+this.name);

        const idToName = {};
        const attrIds = new Set(names.map(a => {
            idToName[this._attributes[a].id] = a;
            return this._attributes[a].id;
        }));

        const resultObj = {};
        while(attrIds.size) {
            const {attributes} = await super.readAttributes([...attrIds]);
            const result = this._attributeArrayStatusDataType.fromBuffer(attributes, 0);
            if(!result.length) break;

            result.forEach(a => {
                attrIds.delete(a.id);
                if(a.status === 'SUCCESS')
                    resultObj[idToName[a.id]] = a.value;
            });
        }

        console.log(resultObj);
        return resultObj;
    }

    async writeAttributes(attributes = {}) {
        const arr = Object.keys(attributes).map(n => {
            const attr = this._attributes[n];
            if(!attr)
                throw new TypeError(n+' is not a valid attribute of '+this.name);
            return {
                id: attr.id,
                value: attributes[n],
            };
        });
        return super.writeAttributes(arr);
    }


    async writeAttributesAtomic(attributes = {}) {
        const arr = Object.keys(attributes).map(n => {
            const attr = this._attributes[n];
            if(!attr)
                throw new TypeError(n+' is not a valid attribute of '+this.name);
            return {
                id: attr.id,
                data: attributes[n],
            };
        });
        return super.writeAttributesAtomic(arr);
    }

    async configureReporting(attributes = {}) {
        //attributeName:{minInterval = 0, maxInterval = 0xffff, minChange = 1} = {}
        const req = [];
        for(const attributeName in attributes) {
            const attr = this._attributes[attributeName];
            if(!attr) throw new TypeError(attributeName+' Does not exist ('+this.constructor.name+')');

            const config = {
                attributeId     : attr.id,
                attributeType   : attr.type,
                minInterval     : 0,
                maxInterval     : 0xffff,
                minChange       : 1,
                ...attributes[attributeName],
            };
            if(attr.type.isAnalog) {
                var buf = Buffer.alloc(attr.length > 0 ? attr.length : 255);
                buf = buf.slice(0, attr.type.toBuffer(buf, config.minChange, 0));
                config.minChange = buf;
            } else
                delete config.minChange;

            req.push(config);
        }
        if(req.length) {
            const res = await super.configureReporting(req);
            for(const result of res) {
                if(result.status !== 'SUCCESS')
                    throw new Error(result.status);
            }
        }
    }

    //Adds command proxy stubs to a proto object which is one level higher.
    //this way you can 'override' the commands and still use `super.` to access the default implementation
    static _addPrototypeMethods(clusterClass) {

        const firstProto = Object.getPrototypeOf(clusterClass.prototype);
        const proto = Object.create(firstProto);
        Object.setPrototypeOf(clusterClass.prototype, proto);

        const commands = clusterClass.COMMANDS;

        for(const cmdName in commands) {
            Object.defineProperty(proto, cmdName, {
                value: {[cmdName]: async function(...args) {
                    const cmd = commands[cmdName];
                    const payload = {
                        cmdId: cmd.id,
                        trxSequenceNumber   : this.nextSeqNr(),
                    };

                    if(cmd.frameControl) {
                        payload.frameControl = cmd.frameControl;
                    }

                    if(cmd.args) {
                        payload.data = ZCLStruct(this.name+'.'+cmdName, cmd.args).fromArgs(...args);
                    }

                    if(payload.frameControl && payload.frameControl.includes('disableDefaultResponse'))
                        return this.sendFrame(payload);

                    const responseArgs = cmd.response && cmd.response.args || {
                        cmdId: ZCLDataTypes.uint8,
                        status: ZCLDataTypes.enum8Status,
                    };

                    console.log(payload);

                    const [response, result] = await Promise.all([
                        this._awaitPacket(payload.trxSequenceNumber, ZCLStruct(this.name+'.'+cmdName+'.response', responseArgs)),
                        this.sendFrame(payload),
                    ]);

                    console.log(response, result);
                    return response;
                }}[cmdName],
            });
        }
    }

    static addCluster(clusterClass) {
        this._addPrototypeMethods(clusterClass);
        this.clusters[clusterClass.ID] = clusterClass;
    }

    static removeCluster(clusterId) {
        delete this.clusters[clusterId];
    }

    static getCluster(clusterId) {
        return this.clusters[clusterId];
    }
}
Cluster.clusters = {};
Cluster._addPrototypeMethods(Cluster);

module.exports = Cluster;