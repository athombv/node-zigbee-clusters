
class BoundCluster {
    async handleFrame(frame, meta, rawFrame) {
        const commands = this.cluster.commandsById[frame.cmdId] || [];

        const command = commands.filter(cmd => 
            frame.frameControl.clusterSpecific === !cmd.global 
            && frame.frameControl.manufacturerSpecific === !!cmd.manufacturerSpecific
        ).pop();

        //TODO: if multiple results, pick proper one based on direction

        if(command) {
            const args = command.args ? 
                command.args.fromBuffer(frame.data, 0)
                : undefined;

            if(this[command.name]) {
                const result = await this[command.name](args, meta, frame, rawFrame);
                if(command.response && command.response.args && !frame.frameControl.disableDefaultResponse) {
                    const payload = new command.response.args(result);
                    //TODO: command without args, return ZCLFrame
                    return payload;
                }
            }
        }

        console.log(this.cluster.NAME, '(bound) unknown command received:', command.name || frame.cmdId, frame, meta);

        throw new Error("unknown_command_received:"+(command.name || frame.cmdId));
    }

    async readAttributes({attributes} = {}) {
        attributes = attributes.map(a => this.cluster.attributesById[a]);
        console.log(attributes);
        throw new Error('not_implemented');
        return {attributes};
    }

    async writeAttributes({attributes} = {}) {
        throw new Error('not_implemented');
        return {attributes};
    }

    async writeAttributesAtomic({attributes} = {}) {
        throw new Error('not_implemented');
        return {attributes};
    }

    async configureReporting({reports = {
        direction,
        attributeId,
        attributeType,
        minInterval,
        maxInterval,
        minChange,
    }}) {
        throw new Error('not_implemented');
        return {reports,
            status,
            direction,
            attributeId,
        };
    }


    async readReportingConfiguration({attributes = {direction, attributeId}}) {
        throw new Error('not_implemented');
        return reports;
    }

    async reportAttributes({attributes}) {
        throw new Error('not_implemented');
    }

    async discoverAttributes({startValue, maxResults}) {

        throw new Error('not_implemented');

        return {
            lastResponse: true,
            attributes: [
                {
                    id,
                    dataTypeId,
                }
            ]
        }
    }

    async readAttributesStructured({attributes = [{attributeId, indexPath}]}) {
        throw new Error('not_implemented');
        return {attributes};
    }

    async writeAttributesStructured({attributes = [{
        attributeId,
        indexPath,
        dataTypeId,
        value,
    }]}) {
        throw new Error('not_implemented');
        return {attributes};
    }

    async discoverCommandsReceived({startValue, maxResults}) {
        throw new Error('not_implemented');
        return {lastResponse: true, commandIds: []};
    }

    async discoverCommandsGenerated({startValue, maxResults}) {
        throw new Error('not_implemented');
        return {lastResponse: true, commandIds: []};
    }

    async discoverAttributesExtended({startValue, maxResults}) {
        throw new Error('not_implemented');
        return {lastResponse: true, attributes: [{
            id,
            dataTypeId,
            acl: ['readable', 'writable','reportable'],
        }]};
    }
 
};

module.exports = BoundCluster;