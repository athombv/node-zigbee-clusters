const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
    currentValue: { id: 0x55, type: ZCLDataTypes.uint16 },
};

const COMMANDS = {};

class MultistateInputCluster extends Cluster {

    static get ID() {
        return 18; // 0x12
    }

    static get NAME() {
        return 'multistateInput';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(MultistateInputCluster);

module.exports = MultistateInputCluster;