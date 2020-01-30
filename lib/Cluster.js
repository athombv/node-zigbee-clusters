const EventEmitter = require('events');
const {ZCLStandardHeader, ZCLMfgSpecificHeader, ZCLAttributeDataRecord} = require('./zclFrames');
const {ZCLStruct, ZCLDataTypes} = require('./zclTypes');

const GLOBAL_ATTRIBUTES = {
    clusterRevision             : { id: 0xfffd,      type: ZCLDataTypes.uint16 },
    attributeReportingStatus    : { id: 0xfffe,      type: ZCLDataTypes.enum8({
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
                reverse             : ZCLDataTypes.bool,
                attributeId         : ZCLDataTypes.uint16,
                attributeType       : ZCLDataTypes.uint8,
                minInterval         : ZCLDataTypes.uint16,
                maxInterval         : ZCLDataTypes.uint16,
                minChange           : ZCLDataTypes.buffer,
            }))
        }, response             : { id: 0x07, args: {
            reports                 : ZCLDataTypes.Array0(ZCLStruct('ConfigureReportingResponse', {
                status                  : ZCLDataTypes.enum8Status,
                reverse                 : ZCLDataTypes.bool,
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
            reports                 : ZCLDataTypes.buffer,
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
    constructor(endpoint) {
        super();

        this._endpoint = endpoint;
        this._nextTrxSeqNr = 0;

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
        const commands = this.constructor.commandsById[frame.cmdId] || [];

        const command = commands.filter(cmd => 
            frame.frameControl.clusterSpecific === !cmd.global 
            && (cmd.global || frame.frameControl.manufacturerSpecific === !!cmd.manufacturerId)
            && (cmd.global || !frame.frameControl.manufacturerSpecific || frame.manufacturerId === cmd.manufacturerId)
        )
        .sort((a,b) => (a.isResponse ? 1 : 0) - (b.isResponse ? 1 : 0))
        .pop();

        if(command) {
            const handlerName = 'on'+command.name.charAt(0).toUpperCase() + command.name.slice(1);

            const args = command.args ? 
                command.args.fromBuffer(frame.data, 0)
                : undefined;

            const handler = this._trxHandlers[frame.trxSequenceNumber] || this[handlerName];
            delete this._trxHandlers[frame.trxSequenceNumber];

            if(handler) {
                const response = await handler.call(this, args, meta, frame, rawFrame);
                if(command.response && command.response.args) {
                    return [command.response.id, new command.response.args(response)];
                }
                return;
            }
        }

        console.log(this.constructor.NAME, 'unknown command received:', frame, meta);

        throw new Error("unknown_command_received");
    }

    async _awaitPacket(trxSequenceNumber, type, timeout = 25000) {
        if(this._trxHandlers[trxSequenceNumber])
            throw new TypeError('already waiting for this trx: '+trxSequenceNumber);
        return new Promise((resolve, reject) => {
            const t = setTimeout(() => reject(new Error('timeout')), timeout);
            this._trxHandlers[trxSequenceNumber] = async (frame) => {
                resolve(frame);
                clearTimeout(t);
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

    async onReportAttributes({attributes} = {}) {
        attributes = this.constructor.attributeArrayDataType.fromBuffer(attributes, 0);
        attributes.forEach(attr => {
            this.emit('attr.'+attr.name, attr.value);
        });
    }

    async onDiscoverCommandsGenerated({startValue = 0, maxResults = 250} = {}) {
        const cmds = [].concat(...Object.values(this.constructor.commandsById))
            .filter(c => !c.global && !c.isResponse && this[c.name])
            .map(c => c.id)
            .sort()
            .filter(cId => cId >= startValue);

        const result = cmds.slice(0, maxResults);
        return {
            lastResponse: result.length === cmds.length,
            commandIds: result,
        };
    }

    async onDiscoverCommandsReceived({startValue = 0, maxResults = 250} = {}) {
        const cmds = [].concat(...Object.values(this.constructor.commandsById))
            .filter(c => 
                !c.global && c.response && 
                (this[c.name] || this['on'+c.name.charAt(0).toUpperCase() + c.name.slice(1)]))
            .map(c => c.response.id)
            .sort()
            .filter(cId => cId >= startValue);

        const result = cmds.slice(0, maxResults);
        return {
            lastResponse: result.length === cmds.length,
            commandIds: result,
        };
    }


    /// START OVERRIDDEN COMMANDS

    async readAttributes(...names) {
        if(!names.length) {
            names = Object.keys(this.constructor.attributes);
        }
        let mismatch = names.find(n => !this.constructor.attributes[n])
        if(mismatch)
            throw new TypeError(mismatch+' is not a valid attribute of '+this.name);

        const idToName = {};
        const attrIds = new Set(names.map(a => {
            idToName[this.constructor.attributes[a].id] = a;
            return this.constructor.attributes[a].id;
        }));

        const resultObj = {};
        while(attrIds.size) {
            const {attributes} = await super.readAttributes({attributes: [...attrIds]});
            const result = this.constructor.attributeArrayStatusDataType.fromBuffer(attributes, 0);
            if(!result.length) break;

            result.forEach(a => {
                attrIds.delete(a.id);
                if(a.status === 'SUCCESS')
                    resultObj[idToName[a.id]] = a.value;
            });
        }

        return resultObj;
    }

    async writeAttributes(attributes = {}) {
        const arr = Object.keys(attributes).map(n => {
            const attr = this.constructor.attributes[n];
            if(!attr)
                throw new TypeError(n+' is not a valid attribute of '+this.name);
            return {
                id: attr.id,
                value: attributes[n],
            };
        });

        let data = Buffer.alloc(1024);
        data = data.slice(0, this.constructor.attributeArrayDataType.toBuffer(data, arr, 0));

        return super.writeAttributes({attributes: data});
    }


    async writeAttributesAtomic(attributes = {}) {
        const arr = Object.keys(attributes).map(n => {
            const attr = this.constructor.attributes[n];
            if(!attr)
                throw new TypeError(n+' is not a valid attribute of '+this.name);
            return {
                id: attr.id,
                data: attributes[n],
            };
        });

        let data = Buffer.alloc(1024);
        data = data.slice(0, this.constructor.attributeArrayDataType.toBuffer(data, arr, 0));
        
        return super.writeAttributesAtomic({attributes: data});
    }

    async configureReporting(attributes = {}) {
        //attributeName:{minInterval = 0, maxInterval = 0xffff, minChange = 1} = {}
        const req = [];
        for(const attributeName in attributes) {
            const attr = this.constructor.attributes[attributeName];
            if(!attr) throw new TypeError(attributeName+' Does not exist ('+this.constructor.name+')');

            const config = {
                reverse         : false,
                attributeId     : attr.id,
                attributeType   : attr.type.id,
                minInterval     : 0,
                maxInterval     : 0xffff,
                minChange       : 1,
                ...attributes[attributeName],
            };
            if(attr.type.isAnalog) {
                let buf = Buffer.alloc(attr.length > 0 ? attr.length : 255);
                buf = buf.slice(0, attr.type.toBuffer(buf, config.minChange, 0));
                config.minChange = buf;
            } else
                delete config.minChange;

            req.push(config);
        }
        if(req.length) {
            const {reports} = await super.configureReporting({reports: req});
            for(const result of reports) {
                if(result.status !== 'SUCCESS')
                    throw new Error(result.status);
            }
        }
    }

    async discoverCommandsGenerated({startValue = 0, maxResults = 255} = {}) {
        const {lastResponse, commandIds} = await super.discoverCommandsGenerated({startValue, maxResults});

        //TODO: Handle lastResponse == false

        const res = commandIds.map(cId => 
            ((this.constructor.commandsById[cId] || [])
                .filter(c => !c.global)
                .sort((a,b) => (a.isResponse ? 1 : 0) - (b.isResponse ? 1 : 0)) //TODO
                .pop() || {})
            .name || cId
        );

        return res;
    }

    async discoverCommandsReceived({startValue = 0, maxResults = 255} = {}) {
        const {lastResponse, commandIds} = await super.discoverCommandsReceived({startValue, maxResults});

        //TODO: Handle lastResponse == false

        const res = commandIds.map(cId => 
            ((this.constructor.commandsById[cId] || [])
                .filter(c => !c.global)
                .sort((a,b) => (a.isResponse ? 0 : 1) - (b.isResponse ? 0 : 1)) //TODO
                .pop() || {})
            .name || cId
        );
        
        return res;
    }

    async discoverAttributes() {
        const { lastResponse, attributes } = await super.discoverAttributes({startValue:0, maxResults:255});

        //TODO: Handle lastResponse == false

        const result = [];
        for(const attr of attributes)
            result.push(this.constructor.attributesById[attr.id].name);

        return result;
    }

    async discoverAttributesExtended() {
        const { lastResponse, attributes } = await super.discoverAttributesExtended({startValue:0, maxResults:255});

        //TODO: Handle lastResponse == false

        const result = {};
        for(const attr of attributes) {
            const attribute = this.constructor.attributesById[attr.id];
            result[attribute.name] = {
                name: attribute.name,
                acl: attr.acl,
            };
        }

        return result;
    }


    /// START STATIC METHODS

    //Adds command proxy stubs to a proto object which is one level higher.
    //this way you can 'override' the commands and still use `super.` to access the default implementation
    static _addPrototypeMethods(clusterClass) {

        const firstProto = Object.getPrototypeOf(clusterClass.prototype);
        const proto = Object.create(firstProto);
        Object.setPrototypeOf(clusterClass.prototype, proto);

        const commands = clusterClass.COMMANDS;

        clusterClass.attributes = {
            ...GLOBAL_ATTRIBUTES,
            ...clusterClass.ATTRIBUTES
        };

        clusterClass.commands = {
            ...GLOBAL_COMMANDS,
            ...clusterClass.COMMANDS,
        };

        clusterClass.attributesById = Object.entries(clusterClass.attributes).reduce((r, [name, a]) => {r[a.id] = {...a, name}; return r}, {});
        clusterClass.attributeArrayStatusDataType = ZCLDataTypes.Array0(ZCLAttributeDataRecord(true, clusterClass.attributesById));
        clusterClass.attributeArrayDataType = ZCLDataTypes.Array0(ZCLAttributeDataRecord(false, clusterClass.attributesById));


        //Ids are not unique
        clusterClass.commandsById = Object.entries(clusterClass.commands).reduce((r, [name, _cmd]) => {
            const cmd = {..._cmd, name};
            if(cmd.args) {
                cmd.args = ZCLStruct(clusterClass.NAME+'.'+name, cmd.args);
                if(_cmd === GLOBAL_COMMANDS.defaultResponse) {
                    clusterClass.defaultResponseArgsType = cmd.args;
                }
            }
            if(r[cmd.id]) {
                r[cmd.id].push(cmd);
            } else {
                r[cmd.id] = [cmd];
            }

            if(cmd.response) {
                const res = {...cmd.response, name: name+'.response', isResponse: true};
                cmd.response = res;
                if(typeof res.id !== 'number') {
                    res.id = cmd.id;
                }
                if(res.args) {
                    res.args = ZCLStruct(clusterClass.NAME+'.'+res.name, res.args);
                }
                if(cmd.global) res.global = true;
                if(cmd.manufacturerSpecific) res.manufacturerSpecific = true;
                if(r[res.id]) {
                    r[res.id].push(res);
                } else {
                    r[res.id] = [res];
                }
            }

            return r;
        }, {});
        

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

                    if(cmd.manufacturerId) {
                        payload.frameControl = ['clusterSpecific', 'manufacturerSpecific'];
                        payload.manufacturerId = cmd.manufacturerId;
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

                    const [response] = await Promise.all([
                        this._awaitPacket(payload.trxSequenceNumber),
                        this.sendFrame(payload),
                    ]);

                    if(response instanceof this.constructor.defaultResponseArgsType) {
                        if(response.status !== 'SUCCESS') {
                            throw new Error(response.status);
                        }
                        return;
                    }

                    return response;
                }}[cmdName],
            });
        }
    }

    static addCluster(clusterClass) {
        this._addPrototypeMethods(clusterClass);
        this.clusters[clusterClass.ID] = clusterClass;
        this.clusters[clusterClass.NAME] = clusterClass;
    }

    static removeCluster(clusterIdOrName) {
        if(this.clusters[clusterIdOrName]) {
            const Cluster = this.clusters[clusterIdOrName];
            delete this.clusters[Cluster.NAME];
            delete this.clusters[Cluster.ID];
        }
    }

    static getCluster(clusterIdOrName) {
        return this.clusters[clusterIdOrName];
    }
}
Cluster.clusters = {};
Cluster._addPrototypeMethods(Cluster);

module.exports = Cluster;
