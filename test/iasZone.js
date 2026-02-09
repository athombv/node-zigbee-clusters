// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const { createMockNode, MOCK_DEVICES } = require('./util');
const { ZCLStandardHeader } = require('../lib/zclFrames');

describe('IAS Zone', function() {
  // Server-to-client notification - requires manual frame
  it('should receive onZoneEnrollRequest', function(done) {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [IASZoneCluster.ID],
      }],
    });

    node.endpoints[1].clusters.iasZone.onZoneEnrollRequest = data => {
      assert.strictEqual(data.zoneType, 'keyPad');
      assert.strictEqual(data.manufacturerCode, 4117);
      done();
    };

    const frame = new ZCLStandardHeader();
    frame.cmdId = IASZoneCluster.COMMANDS.zoneEnrollRequest.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([0x1d, 0x02, 0x15, 0x10]);

    node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});
  });

  // Client-to-server command - can use loopback
  it('should send zoneEnrollResponse', async function() {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [IASZoneCluster.ID],
      }],
    });

    let receivedData = null;
    node.endpoints[1].bind('iasZone', new (class extends BoundCluster {

      async zoneEnrollResponse(data) {
        receivedData = data;
      }

    })());

    await node.endpoints[1].clusters.iasZone.zoneEnrollResponse({
      enrollResponseCode: 'success',
      zoneId: 10,
    });

    assert.strictEqual(receivedData.enrollResponseCode, 'success');
    assert.strictEqual(receivedData.zoneId, 10);
  });

  // Server-to-client notification - requires manual frame
  it('should receive zoneStatusChangeNotification', function(done) {
    const node = createMockNode({
      loopback: true,
      endpoints: [{
        endpointId: 1,
        inputClusters: [IASZoneCluster.ID],
      }],
    });

    node.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => {
      assert.strictEqual(data.zoneStatus.supervisionReports, true);
      assert.strictEqual(data.extendedStatus, 0);
      assert.strictEqual(data.zoneId, 10);
      assert.strictEqual(data.delay, 108);
      done();
    };

    const frame = new ZCLStandardHeader();
    frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([0x10, 0x00, 0x00, 0x0A, 0x6C, 0x00]);

    node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});
  });

  describe('Mock Device Factory', function() {
    it('should create a motion sensor with correct zone type', function() {
      const sensor = MOCK_DEVICES.motionSensor();
      const boundCluster = sensor.endpoints[1].bindings.iasZone;
      assert.strictEqual(boundCluster.zoneType, 0x000D, 'Should be motion sensor type');
      assert.strictEqual(boundCluster.zoneState, 1, 'Should be enrolled');
    });

    it('should create a contact sensor with correct zone type', function() {
      const sensor = MOCK_DEVICES.contactSensor();
      const boundCluster = sensor.endpoints[1].bindings.iasZone;
      assert.strictEqual(boundCluster.zoneType, 0x0015, 'Should be contact switch type');
      assert.strictEqual(boundCluster.zoneState, 1, 'Should be enrolled');
    });

    it('should allow attribute overrides', function() {
      const sensor = MOCK_DEVICES.motionSensor({
        iasZone: { zoneStatus: 0x0001 }, // Alarm1 active
      });
      const boundCluster = sensor.endpoints[1].bindings.iasZone;
      assert.strictEqual(boundCluster.zoneStatus, 0x0001, 'Should have alarm1 bit set');
    });

    it('should create temp/humidity sensor with measurement values', function() {
      const sensor = MOCK_DEVICES.tempHumiditySensor();
      const tempCluster = sensor.endpoints[1].bindings.temperatureMeasurement;
      const humCluster = sensor.endpoints[1].bindings.relativeHumidity;
      assert.strictEqual(tempCluster.measuredValue, 2150, 'Should be 21.50°C raw');
      assert.strictEqual(humCluster.measuredValue, 6500, 'Should be 65.00% raw');
    });
  });
});
