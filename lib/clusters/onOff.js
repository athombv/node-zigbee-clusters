const Cluster = require('../Cluster');
const {ZCLDataTypes} = require('../zclTypes');

const ATTRIBUTES = {
    onOff               : { id: 0,      type: ZCLDataTypes.bool  },
};

const COMMANDS = {
    setOff                 : { id: 0 },
    setOn                  : { id: 1 },
    toggle              : { id: 2 },
};


class OnOffCluster extends Cluster {

    static get ID() {
        return 6;
    }

    static get NAME() {
        return 'onOff';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(OnOffCluster);

module.exports = OnOffCluster;