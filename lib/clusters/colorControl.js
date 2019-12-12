const Cluster = require('../Cluster');
const {ZCLDataTypes} = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {
};


class ColorControlCluster extends Cluster {

    static get ID() {
        return 0x0300;
    }

    static get NAME() {
        return 'colorControl';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(ColorControlCluster);

module.exports = ColorControlCluster;