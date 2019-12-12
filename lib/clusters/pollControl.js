const Cluster = require('../Cluster');
const {ZCLDataTypes} = require('../zclTypes');

const ATTRIBUTES = {
};

const COMMANDS = {

};


class PollControlCluster extends Cluster {

    static get ID() {
        return 0x0020;
    }

    static get NAME() {
        return 'pollControl';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(PollControlCluster);

module.exports = PollControlCluster;