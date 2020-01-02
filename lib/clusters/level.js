const Cluster = require('../Cluster');
const {ZCLDataTypes} = require('../zclTypes');

const ATTRIBUTES = {
    currentLevel: { id: 0, type: ZCLDataTypes.uint8 }
};

const COMMANDS = {
    moveToLevel         : { id: 0 },
    move                : { id: 1 },
    stop                : { id: 7 },
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