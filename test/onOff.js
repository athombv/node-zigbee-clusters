// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const Node = require('../lib/Node');
const { ZCLStandardHeader } = require('../lib/zclFrames');

const endpointId = 1;

describe('On/Off', function() {
  it('should receive setOn', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      OnOffCluster.NAME,
      new (class extends BoundCluster {

        async setOn() {
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = OnOffCluster.COMMANDS.setOn.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.alloc(0);

    node.handleFrame(endpointId, OnOffCluster.ID, frame.toBuffer(), {});
  });

  it('should receive setOff', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      OnOffCluster.NAME,
      new (class extends BoundCluster {

        async setOff() {
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = OnOffCluster.COMMANDS.setOff.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.alloc(0);

    node.handleFrame(endpointId, OnOffCluster.ID, frame.toBuffer(), {});
  });

  it('should receive toggle', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      OnOffCluster.NAME,
      new (class extends BoundCluster {

        async toggle() {
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = OnOffCluster.COMMANDS.toggle.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.alloc(0);

    node.handleFrame(endpointId, OnOffCluster.ID, frame.toBuffer(), {});
  });

  it('should receive onWithTimedOff', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [OnOffCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      OnOffCluster.NAME,
      new (class extends BoundCluster {

        async onWithTimedOff(data) {
          assert.strictEqual(data.onOffControl, 0x01);
          assert.strictEqual(data.onTime, 100);
          assert.strictEqual(data.offWaitTime, 50);
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = OnOffCluster.COMMANDS.onWithTimedOff.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // onOffControl: 0x01, onTime (uint16 LE): 100, offWaitTime (uint16 LE): 50
    frame.data = Buffer.from([0x01, 0x64, 0x00, 0x32, 0x00]);

    node.handleFrame(endpointId, OnOffCluster.ID, frame.toBuffer(), {});
  });
});
