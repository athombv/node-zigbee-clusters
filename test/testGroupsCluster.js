const Cluster = require('../lib/Cluster');
require('../lib/clusters/groups')

const Basic = Cluster.getCluster(4);
const tst = new Basic({sendFrame: console.log});

tst.readAttributes('nameSupport');
tst.getGroupMembership({groupIds:[1,2,3,4]});