// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const DoorLockCluster = require('../lib/clusters/doorLock');
const { createMockNode } = require('./util');
const { ZCLStandardHeader } = require('../lib/zclFrames');

describe('Door Lock', function() {
  it('should receive lockDoor', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('doorLock', new (class extends BoundCluster {

      async lockDoor(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.doorLock.lockDoor({
      pinCode: Buffer.from([0x31, 0x32, 0x33, 0x34]),
    });

    assert.deepStrictEqual(receivedData.pinCode, Buffer.from([0x31, 0x32, 0x33, 0x34]));
  });

  it('should receive unlockDoor', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('doorLock', new (class extends BoundCluster {

      async unlockDoor(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.doorLock.unlockDoor({
      pinCode: Buffer.from([0x30, 0x30, 0x30, 0x30]),
    });

    assert.deepStrictEqual(receivedData.pinCode, Buffer.from([0x30, 0x30, 0x30, 0x30]));
  });

  it('should receive setPINCode', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('doorLock', new (class extends BoundCluster {

      async setPINCode(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.doorLock.setPINCode({
      userId: 1,
      userStatus: 'occupiedEnabled',
      userType: 'unrestricted',
      pinCode: Buffer.from([0x35, 0x36, 0x37, 0x38]),
    });

    assert.strictEqual(receivedData.userId, 1);
    assert.strictEqual(receivedData.userStatus, 'occupiedEnabled');
    assert.strictEqual(receivedData.userType, 'unrestricted');
    assert.deepStrictEqual(receivedData.pinCode, Buffer.from([0x35, 0x36, 0x37, 0x38]));
  });

  // Server-to-client notifications require manual frame construction
  // since they are sent BY the device TO the controller
  it('should receive operationEventNotification', function(done) {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    node.endpoints[1].clusters.doorLock.onOperationEventNotification = data => {
      assert.strictEqual(data.operationEventSource, 1); // Keypad
      assert.strictEqual(data.operationEventCode, 2); // Unlock
      assert.strictEqual(data.userId, 3);
      assert.deepStrictEqual(data.pin, Buffer.from([0x31, 0x32, 0x33, 0x34]));
      assert.strictEqual(data.zigBeeLocalTime, 0x12345678);
      assert.deepStrictEqual(data.data, Buffer.from([]));
      done();
    };

    const frame = new ZCLStandardHeader();
    frame.cmdId = DoorLockCluster.COMMANDS.operationEventNotification.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([
      0x01, 0x02, 0x03, 0x00,
      0x04, 0x31, 0x32, 0x33, 0x34,
      0x78, 0x56, 0x34, 0x12,
      0x00,
    ]);

    node.handleFrame(1, DoorLockCluster.ID, frame.toBuffer(), {});
  });

  it('should receive programmingEventNotification', function(done) {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [DoorLockCluster.ID],
      }],
    });

    node.endpoints[1].clusters.doorLock.onProgrammingEventNotification = data => {
      assert.strictEqual(data.programEventSource, 2); // RF
      assert.strictEqual(data.programEventCode, 3); // PIN added
      assert.strictEqual(data.userId, 7);
      assert.deepStrictEqual(data.pin, Buffer.from([0x35, 0x36, 0x37, 0x38]));
      assert.strictEqual(data.userType, 'unrestricted');
      assert.strictEqual(data.userStatus, 'occupiedEnabled');
      assert.strictEqual(data.zigBeeLocalTime, 0xAABBCCDD);
      assert.deepStrictEqual(data.data, Buffer.from([]));
      done();
    };

    const frame = new ZCLStandardHeader();
    frame.cmdId = DoorLockCluster.COMMANDS.programmingEventNotification.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([
      0x02, 0x03, 0x07, 0x00,
      0x04, 0x35, 0x36, 0x37, 0x38,
      0x00, 0x01,
      0xDD, 0xCC, 0xBB, 0xAA,
      0x00,
    ]);

    node.handleFrame(1, DoorLockCluster.ID, frame.toBuffer(), {});
  });
});
