// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const Cluster = require('../lib/Cluster');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const SceneCluster = require('../lib/clusters/scenes');

const MANUFACTURER_ID_1 = 0x1234;
const MANUFACTURER_ID_2 = 0x4321;

class IkeaSceneCluster extends SceneCluster {

  static get ATTRIBUTES() {
    return {
      sceneCount: {
        id: 0,
        type: ZCLDataTypes.uint8,
        manufacturerId: MANUFACTURER_ID_1, // Fake manufacturer specific attribute
      },
      currentScene: {
        id: 1,
        type: ZCLDataTypes.uint8,
        manufacturerId: MANUFACTURER_ID_2, // Fake manufacturer specific attribute
      },
      currentGroup: {
        id: 2,
        type: ZCLDataTypes.uint16,
        manufacturerId: MANUFACTURER_ID_2, // Fake manufacturer specific attribute
      },
      sceneValid: {
        id: 3,
        type: ZCLDataTypes.bool,
      },
    };
  }

  static get COMMANDS() {
    return {
      ...super.COMMANDS,
      ikeaSceneStep: {
        id: 0x07,
        manufacturerId: 0x117C,
        args: {
          mode: ZCLDataTypes.enum8({
            up: 0,
            down: 1,
          }),
          stepSize: ZCLDataTypes.uint8,
          transitionTime: ZCLDataTypes.uint16,
        },
      },
      ikeaSceneMove: {
        id: 0x08,
        manufacturerId: 0x117C,
        args: {
          mode: ZCLDataTypes.enum8({
            up: 0,
            down: 1,
          }),
          transitionTime: ZCLDataTypes.uint16,
        },
      },
      ikeaSceneMoveStop: {
        id: 0x09,
        manufacturerId: 0x117C,
        args: {
          duration: ZCLDataTypes.uint16,
        },
      },
    };
  }

}

Cluster.addCluster(IkeaSceneCluster);
const { loopbackNode } = require('./util');

const node = loopbackNode([
  {
    endpointId: 1,
    inputClusters: [5],
  },
]);

class IkeaBoundCluster extends BoundCluster {

  constructor({
    onReadAttributes,
    onWriteAttributes,
    onConfigureReporting,
    onReadReportingConfiguration,
    onIkeaSceneStep,
    onIkeaSceneMove,
    onIkeaSceneMoveStop,
  } = {}) {
    super();
    if (onReadAttributes) this.readAttributes = onReadAttributes;
    if (onWriteAttributes) this.writeAttributes = onWriteAttributes;
    if (onConfigureReporting) this.configureReporting = onConfigureReporting;
    if (onReadReportingConfiguration) {
      this.readReportingConfiguration = onReadReportingConfiguration;
    }
    if (onIkeaSceneStep) this.ikeaSceneStep = onIkeaSceneStep;
    if (onIkeaSceneMove) this.ikeaSceneMove = onIkeaSceneMove;
    if (onIkeaSceneMoveStop) this.ikeaSceneMoveStop = onIkeaSceneMoveStop;
  }

}

describe('manufacturer specific commands', function() {
  it('should execute custom commands', function(done) {
    let commandsExecuted = 0;
    const ikeaSceneStepCommand = {
      mode: 'up',
      stepSize: 1,
      transitionTime: 13,
    };
    const ikeaSceneMoveCommand = {
      mode: 'up',
      transitionTime: 13,
    };
    const ikeaSceneMoveStop = {
      duration: 1000,
    };
    node.endpoints[1].bind('scenes', new IkeaBoundCluster({
      onIkeaSceneStep: payload => {
        commandsExecuted++;
        assert.deepStrictEqual({ ...payload }, ikeaSceneStepCommand);
        if (commandsExecuted === 3) done();
      },
      onIkeaSceneMove: payload => {
        commandsExecuted++;
        assert.deepStrictEqual({ ...payload }, ikeaSceneMoveCommand);
        if (commandsExecuted === 3) done();
      },
      onIkeaSceneMoveStop: payload => {
        commandsExecuted++;
        assert.deepStrictEqual({ ...payload }, ikeaSceneMoveStop);
        if (commandsExecuted === 3) done();
      },
    }));

    node.endpoints[1].clusters['scenes'].ikeaSceneStep(ikeaSceneStepCommand);
    node.endpoints[1].clusters['scenes'].ikeaSceneMove(ikeaSceneMoveCommand);
    node.endpoints[1].clusters['scenes'].ikeaSceneMoveStop(ikeaSceneMoveStop);
  });

  describe('global commands', function() {
    describe('readAttributes', function() {
      it('should set correct manufacturerId', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onReadAttributes: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_1, rawPayload.manufacturerId);
            done();
          },
        }));
        node.endpoints[1].clusters['scenes'].readAttributes('sceneCount');
      });
      it('should throw when different manufacturerIds are found', function(done) {
        node.endpoints[1].clusters['scenes'].readAttributes('sceneCount', 'currentScene')
          .catch(err => {
            assert(err instanceof Error);
            done();
          });
      });
      it('should set correct manufacturerId for multiple attributes', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onReadAttributes: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_2, rawPayload.manufacturerId);
            done();
          },
        }));

        node.endpoints[1].clusters['scenes'].readAttributes('currentScene', 'currentGroup');
      });
      it('should not set manufacturerId when zcl attribute is present', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onReadAttributes: (payload, meta, rawPayload) => {
            assert.strictEqual(undefined, rawPayload.manufacturerId);
            done();
          },
        }));

        node.endpoints[1].clusters['scenes'].readAttributes('sceneValid');
      });
    });

    describe('writeAttributes', function() {
      it('should set correct manufacturerId', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onWriteAttributes: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_1, rawPayload.manufacturerId);
            done();
          },
        }));
        node.endpoints[1].clusters['scenes'].writeAttributes({ sceneCount: 1 });
      });
      it('should throw when different manufacturerIds are found', function(done) {
        node.endpoints[1].clusters['scenes'].writeAttributes({ sceneCount: 1, currentScene: 2 })
          .catch(err => {
            assert(err instanceof Error);
            done();
          });
      });
      it('should set correct manufacturerId for multiple attributes', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onWriteAttributes: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_2, rawPayload.manufacturerId);
            done();
          },
        }));

        node.endpoints[1].clusters['scenes'].writeAttributes({ currentScene: 1, currentGroup: 2 });
      });
      it('should not set manufacturerId when zcl attribute is present', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onWriteAttributes: (payload, meta, rawPayload) => {
            assert.strictEqual(undefined, rawPayload.manufacturerId);
            done();
          },
        }));

        node.endpoints[1].clusters['scenes'].writeAttributes({ sceneValid: true });
      });
    });

    describe('configureReporting', function() {
      it('should set correct manufacturerId', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onConfigureReporting: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_1, rawPayload.manufacturerId);
            done();
          },
        }));
        node.endpoints[1].clusters['scenes'].configureReporting({ sceneCount: { minInterval: 0, maxInterval: 300, minChange: 1 } });
      });
      it('should throw when different manufacturerIds are found', function(done) {
        node.endpoints[1].clusters['scenes'].configureReporting({
          sceneCount: { minInterval: 0, maxInterval: 300, minChange: 1 },
          currentScene: { minInterval: 0, maxInterval: 300, minChange: 1 },
        })
          .catch(err => {
            assert(err instanceof Error);
            done();
          });
      });
      it('should set correct manufacturerId for multiple attributes', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onConfigureReporting: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_2, rawPayload.manufacturerId);
            done();
          },
        }));
        node.endpoints[1].clusters['scenes'].configureReporting({
          currentScene: { minInterval: 0, maxInterval: 300, minChange: 1 },
          currentGroup: { minInterval: 0, maxInterval: 300, minChange: 1 },
        });
      });
      it('should not set manufacturerId when zcl attribute is present', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onConfigureReporting: (payload, meta, rawPayload) => {
            assert.strictEqual(undefined, rawPayload.manufacturerId);
            done();
          },
        }));

        node.endpoints[1].clusters['scenes'].configureReporting({
          sceneValid: { minInterval: 0, maxInterval: 300, minChange: 1 },
          currentGroup: { minInterval: 0, maxInterval: 300, minChange: 1 },
        });
      });
    });

    describe('readReportingConfiguration', function() {
      it('should set correct manufacturerId', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onReadReportingConfiguration: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_1, rawPayload.manufacturerId);
            done();
          },
        }));
        node.endpoints[1].clusters['scenes'].readReportingConfiguration(['sceneCount']);
      });
      it('should throw when different manufacturerIds are found', function(done) {
        node.endpoints[1].clusters['scenes'].readReportingConfiguration(['sceneCount', 'currentScene'])
          .catch(err => {
            assert(err instanceof Error);
            done();
          });
      });
      it('should set correct manufacturerId for multiple attributes', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onReadReportingConfiguration: (payload, meta, rawPayload) => {
            assert.strictEqual(MANUFACTURER_ID_2, rawPayload.manufacturerId);
            done();
          },
        }));
        node.endpoints[1].clusters['scenes'].readReportingConfiguration(['currentGroup', 'currentScene']);
      });
      it('should not set manufacturerId when zcl attribute is present', function(done) {
        node.endpoints[1].bind('scenes', new IkeaBoundCluster({
          onReadReportingConfiguration: (payload, meta, rawPayload) => {
            assert.strictEqual(undefined, rawPayload.manufacturerId);
            done();
          },
        }));

        node.endpoints[1].clusters['scenes'].readReportingConfiguration(['currentGroup', 'sceneValid']);
      });
    });
  });
});
