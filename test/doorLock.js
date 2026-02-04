// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const DoorLockCluster = require('../lib/clusters/doorLock');
const Node = require('../lib/Node');
const { ZCLStandardHeader } = require('../lib/zclFrames');

const endpointId = 1;

describe('Door Lock', function() {
  it('should receive lockDoor', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      DoorLockCluster.NAME,
      new (class extends BoundCluster {

        async lockDoor(data) {
          assert.deepStrictEqual(data.pinCode, Buffer.from([0x31, 0x32, 0x33, 0x34]));
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = DoorLockCluster.COMMANDS.lockDoor.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // pinCode (octstr): length 4, data "1234" = 0x31 0x32 0x33 0x34
    frame.data = Buffer.from([0x04, 0x31, 0x32, 0x33, 0x34]);

    node.handleFrame(endpointId, DoorLockCluster.ID, frame.toBuffer(), {});
  });

  it('should receive unlockDoor', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      DoorLockCluster.NAME,
      new (class extends BoundCluster {

        async unlockDoor(data) {
          assert.deepStrictEqual(data.pinCode, Buffer.from([0x30, 0x30, 0x30, 0x30]));
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = DoorLockCluster.COMMANDS.unlockDoor.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // pinCode (octstr): length 4, data "0000" = 0x30 0x30 0x30 0x30
    frame.data = Buffer.from([0x04, 0x30, 0x30, 0x30, 0x30]);

    node.handleFrame(endpointId, DoorLockCluster.ID, frame.toBuffer(), {});
  });

  it('should receive setPINCode', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      DoorLockCluster.NAME,
      new (class extends BoundCluster {

        async setPINCode(data) {
          assert.strictEqual(data.userId, 1);
          assert.strictEqual(data.userStatus, 'occupiedEnabled');
          assert.strictEqual(data.userType, 'unrestricted');
          assert.deepStrictEqual(data.pinCode, Buffer.from([0x35, 0x36, 0x37, 0x38]));
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = DoorLockCluster.COMMANDS.setPINCode.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // userId (uint16 LE): 1 = 0x01 0x00
    // userStatus (enum8): occupiedEnabled = 1
    // userType (enum8): unrestricted = 0
    // pinCode (octstr): length 4, data "5678" = 0x35 0x36 0x37 0x38
    frame.data = Buffer.from([0x01, 0x00, 0x01, 0x00, 0x04, 0x35, 0x36, 0x37, 0x38]);

    node.handleFrame(endpointId, DoorLockCluster.ID, frame.toBuffer(), {});
  });
});
