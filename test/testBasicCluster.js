const {ZCLStandardHeader} = require('../lib/zclFrames');
const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');

require('../lib/clusters/basic');

const remotenode = {sendFrame: (...args) => remotenode.handleFrame(...args), bind: console.log, endpointDescriptors: [
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
    get manufacturerName() {
        return "Test";
    }

    get modelId() {
        return "TestDev";
    }
}

node.endpoints[1].bind('basic', new CustomHandler());

tst.readAttributes('modelId', 'zclVersion');

//node.handleFrame(1, 0, Buffer.from([0x00, 0x00, 0x00,     0x04, 0x00, 0x05, 0x00]));