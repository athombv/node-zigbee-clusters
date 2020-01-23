
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
    }

    async writeAttributes({attributes} = {}) {
        throw new Error('not_implemented');
    }
 
};

module.exports = BoundCluster;