const Cluster = require('../lib/Cluster');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const SceneCluster = require('../lib/clusters/scenes');

class IkeaSceneCluster extends SceneCluster {
    static get COMMANDS() {
        return {
            ...super.COMMANDS,
            ikeaSceneStep: {
                id              : 0x07,
                manufacturerId  : 0x117C,
                args            : {
                    mode            : ZCLDataTypes.enum8({
                        up            : 0,
                        down          : 1,
                    }),
                    stepSize        : ZCLDataTypes.uint8,
                    transitionTime  : ZCLDataTypes.uint16,
                }
            },
            ikeaSceneMove: {
                id              : 0x08,
                manufacturerId  : 0x117C,
                args            : {
                    mode            : ZCLDataTypes.enum8({
                        up            : 0,
                        down          : 1,
                    }),
                    transitionTime  : ZCLDataTypes.uint16,
                }
            },
            ikeaSceneMoveStop: {
                id              : 0x09,
                manufacturerId  : 0x117C,
                args            : {
                    duration       : ZCLDataTypes.uint16,
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
  async ikeaSceneStep(args) {
    console.log(args);
  }

  async ikeaSceneMove(args) {
    console.log(args);
  }
  
  async ikeaSceneMoveStop(args) {
    console.log(args);
  }
}

node.endpoints[1].bind('scenes', new IkeaBoundCluster());

tst.ikeaSceneStep({
  mode: 'up',
  stepSize: 1,
  transitionTime: 13,
})
tst.ikeaSceneMove({
  mode: 'up',
  transitionTime: 13,
})
tst.ikeaSceneMoveStop({
  duration: 1000,
})