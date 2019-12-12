const Cluster = require('../lib/Cluster');
require('../lib/clusters/groups')

const Basic = Cluster.getCluster(4);
const tst = new Basic({sendFrame: console.log});

tst.readAttributes('nameSupport');
tst.getGroupMembership([1,2,3,4]);