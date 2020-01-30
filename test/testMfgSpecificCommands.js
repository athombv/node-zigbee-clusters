const Cluster = require('../lib/Cluster');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const SceneCluster = require('../lib/clusters/scenes');
require('../lib/clusters/levelControl');

class IkeaSceneCluster extends SceneCluster {
    static get COMMANDS() {
        return {
            ...super.COMMANDS,
            ikeaSceneLoop: {
                id              : 0x07,
                manufacturerId  : 0x117C,
                args            : {
                    id          : ZCLDataTypes.uint16,
                    moveTo      : ZCLDataTypes.Array8(ZCLDataTypes.uint8),
                }
            },
            ikeaSceneButtonButtonDown: {
                id              : 0x08,
                manufacturerId  : 0x117C,
                args            : {
                    id          : ZCLDataTypes.uint16,
                    moveTo      : ZCLDataTypes.Array8(ZCLDataTypes.uint8),
                }
            },
            ikeaSceneButtonButtonUp: {
                id              : 0x09,
                manufacturerId  : 0x117C,
                args            : {
                    id          : ZCLDataTypes.uint16,
                }
            }
        }
    }
}

Cluster.addCluster(IkeaSceneCluster);


const node = require('./loopbackNode')
([
    {
        endpointId: 1,
        inputClusters: [5],
    }
]);

const tst = node.endpoints[1].clusters['scenes'];

class IkeaBoundCluster extends BoundCluster {
  async ikeaSceneLoop({id, moveTo}) {
    console.log('moving %d to %s', id, moveTo[0]?'+1':'-1');
  }

  async ikeaSceneButtonButtonDown({id}) {
    console.log('btn down %d', id);
  }
  
  async ikeaSceneButtonButtonUp({id}) {
    console.log('btn up %d', id);
  }
}

node.endpoints[1].bind('scenes', new IkeaBoundCluster());

tst.ikeaSceneLoop({
  id: 0x0D00,
  moveTo: [1],
})
tst.ikeaSceneButtonButtonDown({
  id: 0x0D00,
})
tst.ikeaSceneButtonButtonUp({
  id: 0x0D00,
})