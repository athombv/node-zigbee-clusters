'use strict';

const ZCLNode = require('./lib/Node');
const Cluster = require('./lib/Cluster');
const Clusters = require('./lib/clusters');
const BoundCluster = require('./lib/BoundCluster');
const zclTypes = require('./lib/zclTypes');
const zclFrames = require('./lib/zclFrames');

const {
  ZCLDataTypes,
  ZCLDataType,
  ZCLStruct,
} = zclTypes;

const clusterIdMap = {};
const clusterNameMap = {};
Object.values(Clusters).forEach(_Cluster => {
  try {
    clusterIdMap[_Cluster.NAME] = _Cluster.ID;
    clusterNameMap[_Cluster.ID] = _Cluster.NAME;
  } catch (err) {
    // Skip lib/Cluster.js which throws when accessing _Cluster.ID
  }
});

const getClusterId = clusterName => clusterIdMap[clusterName];
const getClusterName = clusterId => clusterNameMap[clusterId];

module.exports = {
  getClusterId,
  getClusterName,
  Cluster,
  BoundCluster,
  ZCLNode,
  zclTypes,
  zclFrames,
  ZCLDataTypes,
  ZCLDataType,
  ZCLStruct,
  ...Clusters,
};
