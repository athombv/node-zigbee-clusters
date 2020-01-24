const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
    currentLevel: { id: 0, type: ZCLDataTypes.uint8 }
};

const COMMANDS = {
    move: {
        id: 1, args: {
            moveMode: ZCLDataTypes.enum8({
                up: 0,
                down: 1,
            }),
            rate: ZCLDataTypes.uint8
        }
    },
    moveWithOnOff: {
        id: 5, args: {
            moveMode: ZCLDataTypes.enum8({
                up: 0,
                down: 1,
            }),
            rate: ZCLDataTypes.uint8
        }
    },
    moveToLevelWithOnOff: {
        id: 4, args: {
            level: ZCLDataTypes.uint8,
            transitionTime: ZCLDataTypes.uint16,
        }
    },
    stop: { id: 7 },
};

class LevelControlCluster extends Cluster {

    static get ID() {
        return 8;
    }

    static get NAME() {
        return 'levelControl';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(LevelControlCluster);

module.exports = LevelControlCluster;