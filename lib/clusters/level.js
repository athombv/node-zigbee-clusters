const Cluster = require('../Cluster');
const {ZCLDataTypes} = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {
};


class LevelCluster extends Cluster {

    static get ID() {
        return 8;
    }

    static get NAME() {
        return 'level';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(LevelCluster);

module.exports = LevelCluster;