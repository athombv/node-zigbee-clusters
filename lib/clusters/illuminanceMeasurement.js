const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
    measuredValue: { id: 0, type: ZCLDataTypes.uint16 }
};

const COMMANDS = {};

class IlluminanceMeasurementCluster extends Cluster {

    static get ID() {
        return 1024; // 0x0400
    }

    static get NAME() {
        return 'illuminanceMeasurement';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(IlluminanceMeasurementCluster);

module.exports = IlluminanceMeasurementCluster;