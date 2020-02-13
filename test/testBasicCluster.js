const {ZCLStandardHeader} = require('../lib/zclFrames');
const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');

require('../lib/clusters/basic');

const remotenode = {sendFrame: (...args) => console.log('loopback', ...args) | remotenode.handleFrame(...args), bind: console.log.bind(console, 'binding: ep %d, cluster %d '), endpointDescriptors: [
    {
        endpointId: 1,
        inputClusters: [0],
    }
]};
const node = new Node(remotenode);

const tst = node.endpoints[1].clusters['basic'];

// tst.configureReporting({
//     zclVersion: {
//         minInterval: 1234,
//         maxInterval: 4321
//     }
// });

// tst.readAttributes('zclVersion');
// tst.writeAttributes({
//     zclVersion: 2,
//     physicalEnv: 'Corridor',
// });
// tst.factoryReset();

// node.handleFrame(1, 0, Buffer.from([0x18, 0x00, 0x0A,     0x00, 0x00, 0x20, 0x02, 0x11, 0x00, 0x30, 0x6b]));

class CustomHandler extends BoundCluster {

    constructor() {
        super();
        this.test = 'test';
    }

    get zclVersion() {
        return 2;
    }

    get powerSource() {
        return 'mains';
    }

    get manufacturerName() {
        return 'Athom';
    }

    get modelId() {
        return 'Homey';
    }

    get REPORTABLE_ATTRIBUTES() {
        return ['zclVersion'];
    }

    async factoryReset() {
        console.log('reset!');
    }
}

class SuperBoundCluster extends CustomHandler {

};


node.endpoints[1].bind('basic', new SuperBoundCluster());

//tst.readAttributes('modelId', 'zclVersion', 'manufacturerName');

tst.discoverAttributesExtended()
    .then(attrs => 
        tst.readAttributes(
            ...Object.values(attrs)
            .filter(a => a.acl.readable)
            .map(a => a.name)
        )
    ).then(a => console.log(a));

tst.discoverCommandsGenerated()
    .then(a => console.log('serverGenerated', a));

tst.discoverCommandsReceived()
    .then(a => console.log('serverReceived', a));

tst.onDiscoverCommandsGenerated()
    .then(a => console.log('clientGenerated', a));

tst.onDiscoverCommandsReceived()
    .then(a => console.log('clientReceived', a));

tst.factoryReset();
//node.handleFrame(1, 0, Buffer.from([0x00, 0x00, 0x00,     0x04, 0x00, 0x05, 0x00]));

