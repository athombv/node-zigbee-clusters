const Cluster = require('../lib/Cluster');
require('../lib/clusters/basic');
const {ZCLStandardHeader} = require('../lib/zclFrames');

const Basic = Cluster.getCluster(0);
const tst = new Basic({sendFrame: console.log});

tst.readAttributes('zclVersion');
tst.writeAttributes({
    zclVersion: 2,
    physicalEnv: 'Corridor',
});
tst.factoryReset();

tst.handleFrame(ZCLStandardHeader.fromBuffer(Buffer.from([0x18, 0x00, 0x0A,     0x00, 0x00, 0x20, 0x02, 0x11, 0x00, 0x30, 0x6b])))