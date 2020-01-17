const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
    instantaneousDemand: { id: 0, type: ZCLDataTypes.uint24 }
};

const COMMANDS = {};

class ElectricalMeasurement extends Cluster {

    static get ID() {
        return 2820; // 0x0b04
    }

    static get NAME() {
        return 'electricalMeasurement';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(ElectricalMeasurement);

module.exports = ElectricalMeasurement;