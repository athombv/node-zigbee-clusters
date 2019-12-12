const Cluster = require('../lib/Cluster');
require('../lib/clusters/basic');

const Basic = Cluster.getCluster(0);
const tst = new Basic({sendFrame: console.log});

tst.readAttributes('zclVersion');
tst.writeAttributes({
    zclVersion: 2,
    physicalEnv: 'Corridor',
});
tst.factoryReset();