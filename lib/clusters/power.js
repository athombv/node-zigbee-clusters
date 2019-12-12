const Cluster = require('../Cluster');
const {ZCLDataTypes} = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {
};


class PowerCluster extends Cluster {

    static get ID() {
        return 1;
    }

    static get NAME() {
        return 'power';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(PowerCluster);

module.exports = PowerCluster;