// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const LevelControlCluster = require('../lib/clusters/levelControl');
const Node = require('../lib/Node');
const { ZCLStandardHeader } = require('../lib/zclFrames');

const endpointId = 1;

describe('Level Control', function() {
  it('should receive moveToLevel', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [LevelControlCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      LevelControlCluster.NAME,
      new (class extends BoundCluster {

        async moveToLevel(data) {
          assert.strictEqual(data.level, 128);
          assert.strictEqual(data.transitionTime, 10);
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = LevelControlCluster.COMMANDS.moveToLevel.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // level (uint8): 128 = 0x80, transitionTime (uint16 LE): 10 = 0x0A 0x00
    frame.data = Buffer.from([0x80, 0x0A, 0x00]);

    node.handleFrame(endpointId, LevelControlCluster.ID, frame.toBuffer(), {});
  });

  it('should receive step', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [LevelControlCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      LevelControlCluster.NAME,
      new (class extends BoundCluster {

        async step(data) {
          assert.strictEqual(data.mode, 'up');
          assert.strictEqual(data.stepSize, 50);
          assert.strictEqual(data.transitionTime, 5);
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = LevelControlCluster.COMMANDS.step.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // mode (enum8): up = 0, stepSize (uint8): 50 = 0x32, transitionTime (uint16 LE): 5 = 0x05 0x00
    frame.data = Buffer.from([0x00, 0x32, 0x05, 0x00]);

    node.handleFrame(endpointId, LevelControlCluster.ID, frame.toBuffer(), {});
  });

  it('should receive stop', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [LevelControlCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      LevelControlCluster.NAME,
      new (class extends BoundCluster {

        async stop() {
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = LevelControlCluster.COMMANDS.stop.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.alloc(0);

    node.handleFrame(endpointId, LevelControlCluster.ID, frame.toBuffer(), {});
  });
});
