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
        }}, global              : true
    },

    writeAttributes        : { id: 0x02, args: {
            attributes          : ZCLDataTypes.buffer,
        }, response             : { id: 0x05, args: {
            attributes              : ZCLDataTypes.buffer,
        }}, global              : true
    },

    writeAttributesAtomic  : { id: 0x03, args: {
            attributes          : ZCLDataTypes.buffer,
        }, response             : { id: 0x04, args: {
            attributes              : ZCLDataTypes.buffer,
        }}, global              : true
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
        }, response             : { id: 0x07, args: {
            reports                 : ZCLDataTypes.Array0(ZCLStruct('ConfigureReportingResponse', {
                status                  : ZCLDataTypes.enum8Status,
                direction               : ZCLDataTypes.enum8('receiveReports', 'sendingReports'),
                attributeId             : ZCLDataTypes.uint16,
            }))
        }}, global              : true
    },

    readReportingConfiguration: { id: 0x08, args: {
            attributes          : ZCLDataTypes.Array0(ZCLStruct('ReadReportingConfiguration', {
                direction           : ZCLDataTypes.enum8('receiveReports', 'sendingReports'),
                attributeId         : ZCLDataTypes.uint16,
            }))
        }, response             : { id: 0x09, args: {

        }}, global              : true
    },

    reportAttributes        : { id: 0x0A, args: {
            attributes          : ZCLDataTypes.buffer,
        }, global           : true
    },

    defaultResponse         : { id: 0x0B, args: {
            cmdId               : ZCLDataTypes.uint8,
            status              : ZCLDataTypes.enum8Status,
        }, global           : true
    },

    discoverAttributes      : { id: 0x0C, args: {
            startValue          : ZCLDataTypes.uint16,
            maxResults          : ZCLDataTypes.uint8,
        }, response             : { id: 0x0D, args: {
            lastResponse            : ZCLDataTypes.bool,
            attributes              : ZCLDataTypes.Array0(ZCLStruct('DiscoveredAttribute', {
                id                      : ZCLDataTypes.uint16,
                dataTypeId              : ZCLDataTypes.uint8,
            }))
        }}, global          : true
    },

    readAttributesStructured: { id: 0x0E, args: {
            attributes              : ZCLDataTypes.Array0(ZCLStruct('AttributeSelector', {
                attributeId             : ZCLDataTypes.uint16,
                indexPath               : ZCLDataTypes.Array8(ZCLDataTypes.uint16),
            }))
        }, response             : { id: 0x01, args: {
                attributes          : ZCLDataTypes.buffer,
        }}, global              : true
    },

    writeAttributesStructured: { id: 0x0F, args: {
            attributes              : ZCLDataTypes.Array0(ZCLStruct('AttributeSelector', {
                attributeId             : ZCLDataTypes.uint16,
                indexPath               : ZCLDataTypes.Array8(ZCLDataTypes.uint16),
                dataTypeId              : ZCLDataTypes.uint8,
                value                   : ZCLDataTypes.buffer,
            }))
        }, response             : { id: 0x10, args: {
            attributes              : ZCLDataTypes.buffer
        }}, global              : true
    },

    discoverCommandsReceived: { id: 0x11, args: {
            startValue          : ZCLDataTypes.uint16,
            maxResults          : ZCLDataTypes.uint8,
        }, response             : { id: 0x12, args: {
            lastResponse            : ZCLDataTypes.bool,
            commandIds              : ZCLDataTypes.Array0(ZCLDataTypes.uint8),
        }}, global              : true
    },

    discoverCommandsGenerated: { id: 0x13, args: {
            startValue          : ZCLDataTypes.uint16,
            maxResults          : ZCLDataTypes.uint8,
        }, response             : { id: 0x14, args: {
            lastResponse            : ZCLDataTypes.bool,
            commandIds              : ZCLDataTypes.Array0(ZCLDataTypes.uint8),
        }}, global              : true
    },

    discoverAttributesExtended: { id: 0x15, args: {
            startValue          : ZCLDataTypes.uint16,
            maxResults          : ZCLDataTypes.uint8,
        }, response             : { id: 0x16, args: {
            lastResponse            : ZCLDataTypes.bool,
            attributes              : ZCLDataTypes.Array0(ZCLStruct('DiscoveredAttributeExtended', {
                id                      : ZCLDataTypes.uint16,
                dataTypeId              : ZCLDataTypes.uint8,
                acl                     : ZCLDataTypes.map8('readable', 'writable', 'reportable'),
            }))
        }}, global              : true
    },
};


class Cluster extends EventEmitter {
    constructor(endpoint, binding) {
        super();

        this._endpoint = endpoint;
        this._attributes = {};
        this._nextTrxSeqNr = 0;

        this._attributes = {
            ...GLOBAL_ATTRIBUTES,
            ...this.constructor.ATTRIBUTES
        };

        this._commands = {
            ...GLOBAL_COMMANDS,
            ...this.constructor.COMMANDS,
        };

        //Ids are not unique
        this._commandsById = Object.entries(this._commands).reduce((r, [name, cmd]) => {
            cmd = {...cmd, name};
            if(r[cmd.id]) {
                r[cmd.id].push(cmd);
            }
            r[cmd.id] = [cmd];
            return r;
        }, {});

        this._binding = binding;

        this._attributesById = Object.entries(this._attributes).reduce((r, [name, a]) => {r[a.id] = {...a, name}; return r}, {});
        this._attributeArrayStatusDataType = ZCLDataTypes.Array0(ZCLAttributeDataRecord(true, this._attributesById));
        this._attributeArrayDataType = ZCLDataTypes.Array0(ZCLAttributeDataRecord(false, this._attributesById));

        this.name = this.constructor.NAME;

        this._trxHandlers = {};
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

    /// START HELPERS

    nextSeqNr() {
        this._nextTrxSeqNr = (this._nextTrxSeqNr+1)%256;
        return this._nextTrxSeqNr;
    }

    async handleFrame(frame, meta, rawFrame) {
        const commands = this._commandsById[frame.cmdId] || [];

        const command = commands.filter(cmd => 
            frame.frameControl.clusterSpecific === !cmd.global 
            && frame.frameControl.manufacturerSpecific === !!cmd.manufacturerSpecific
        ).pop();

        if(command) {
            const handlerName = 'on'+command.name.charAt(0).toUpperCase() + command.name.slice(1);

            const args = command.args ? 
                ZCLStruct(this.name+'.'+handlerName, command.args).fromBuffer(frame.data, 0) 
                : undefined;

            const handler = this._trxHandlers[frame.trxSequenceNumber];
            delete this._trxHandlers[frame.trxSequenceNumber];

            if(handler) {
                return await handler(args, meta, frame, rawFrame);
            } else if(this[handlerName]) {
                return await this[handlerName](args, meta, frame, rawFrame);
            }
        }

        console.log(this.constructor.NAME, 'unknown command received:', frame, meta);
    }

    async _awaitPacket(trxSequenceNumber, format, timeout = 25000) {
        if(this._trxHandlers[trxSequenceNumber])
            throw new TypeError('already waiting for this trx: '+trxSequenceNumber);
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('timeout')), timeout);
            this._trxHandlers[trxSequenceNumber] = async (frame) => {
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


    /// START MESSAGE HANDLERS

    async onDefaultResponse({cmdId, status}) {

    }

    async onReportAttributes({attributes} = {}) {
        attributes = this._attributeArrayDataType.fromBuffer(attributes, 0);
        attributes.forEach(attr => {
            this.emit('attr.'+attr.name, attr.value);
        });
    }


    /// START OVERRIDDEN COMMANDS

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
            const {attributes} = await super.readAttributes({attributes: [...attrIds]});
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

        let data = Buffer.alloc(1024);
        data = data.slice(0, this._attributeArrayDataType.toBuffer(data, arr, 0));

        return super.writeAttributes({attributes: data});
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

        let data = Buffer.alloc(1024);
        data = data.slice(0, this._attributeArrayDataType.toBuffer(data, arr, 0));
        
        return super.writeAttributesAtomic({attributes: data});
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


    /// START STATIC METHODS

    //Adds command proxy stubs to a proto object which is one level higher.
    //this way you can 'override' the commands and still use `super.` to access the default implementation
    static _addPrototypeMethods(clusterClass) {

        const firstProto = Object.getPrototypeOf(clusterClass.prototype);
        const proto = Object.create(firstProto);
        Object.setPrototypeOf(clusterClass.prototype, proto);

        const commands = clusterClass.COMMANDS;

        for(const cmdName in commands) {
            Object.defineProperty(proto, cmdName, {
                value: {[cmdName]: async function(args) {
                    const cmd = commands[cmdName];
                    const payload = {
                        cmdId: cmd.id,
                        trxSequenceNumber   : this.nextSeqNr(),
                    };

                    if(cmd.global) {
                        payload.frameControl = [];
                    }

                    if(cmd.frameControl) {
                        payload.frameControl = cmd.frameControl;
                    }

                    if(cmd.args) {
                        const CommandArgs = ZCLStruct(this.name+'.'+cmdName, cmd.args);
                        payload.data = new CommandArgs(args);
                    }

                    if(payload.frameControl && payload.frameControl.includes('disableDefaultResponse'))
                        return this.sendFrame(payload);

                    const responseArgs = cmd.response && cmd.response.args || {
                        cmdId: ZCLDataTypes.uint8,
                        status: ZCLDataTypes.enum8Status,
                    };

                    const [response, result] = await Promise.all([
                        this._awaitPacket(payload.trxSequenceNumber, ZCLStruct(this.name+'.'+cmdName+'.response', responseArgs)),
                        this.sendFrame(payload),
                    ]);

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
