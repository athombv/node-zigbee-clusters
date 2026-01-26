// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const Node = require('../lib/Node');
const { ZCLStandardHeader } = require('../lib/zclFrames');
const { MOCK_DEVICES, verifyClusterAttributes } = require('./util');

const endpointId = 1;

describe('IAS Zone', function() {
  it('should receive onZoneEnrollRequest', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [IASZoneCluster.ID],
      }],
    });

    // Listen for incoming zoneEnrollRequest command
    node.endpoints[endpointId].clusters.iasZone.onZoneEnrollRequest = data => {
      assert.strictEqual(data.zoneType, 'keyPad');
      assert.strictEqual(data.manufacturerCode, 4117);
      done();
    };

    // Create zoneEnrollRequest command
    const frame = new ZCLStandardHeader();
    frame.cmdId = IASZoneCluster.COMMANDS.zoneEnrollRequest.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([0x1d, 0x02, 0x15, 0x10]);

    // Feed frame to node
    node.handleFrame(endpointId, IASZoneCluster.ID, frame.toBuffer(), {});
  });

  it('should send zoneEnrollResponse', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [IASZoneCluster.ID],
      }],
    });

    // Listen for incoming zoneEnrollRequest command on bound cluster
    node.endpoints[endpointId].bind(
      IASZoneCluster.NAME,
      new (class extends BoundCluster {

        async zoneEnrollResponse(data) {
          assert.strictEqual(data.enrollResponseCode, 'success');
          assert.strictEqual(data.zoneId, 10);
          done();
        }

      })(),
    );
    // Zone enroll response
    const frame = new ZCLStandardHeader();
    frame.cmdId = IASZoneCluster.COMMANDS.zoneEnrollResponse.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([0x00, 0x0a]);

    // Feed frame to node
    node.handleFrame(endpointId, IASZoneCluster.ID, frame.toBuffer(), {});
  });

  it('should receive zoneStatusChangeNotification', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [IASZoneCluster.ID],
      }],
    });

    // Listen for incoming zoneEnrollRequest command
    node.endpoints[endpointId].clusters.iasZone.onZoneStatusChangeNotification = data => {
      assert.strictEqual(data.zoneStatus.supervisionReports, true);
      assert.strictEqual(data.extendedStatus, 0);
      assert.strictEqual(data.zoneId, 10);
      assert.strictEqual(data.delay, 108);
      done();
    };

    // Create zoneStatusChangeNotification command
    const frame = new ZCLStandardHeader();
    frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([0x10, 0x00, 0x00, 0x0A, 0x6C, 0x00]);

    // Feed frame to node
    node.handleFrame(endpointId, IASZoneCluster.ID, frame.toBuffer(), {});
  });

  describe('Cluster Completeness', function() {
    it('should have all mandatory IAS Zone attributes', function() {
      const result = verifyClusterAttributes('iasZone');
      assert.strictEqual(result.status, 'pass', `Missing: ${result.missing.join(', ')}`);
    });

    it('should report implemented attributes', function() {
      const result = verifyClusterAttributes('iasZone');
      assert(result.implemented.includes('zoneState'), 'zoneState should be implemented');
      assert(result.implemented.includes('zoneType'), 'zoneType should be implemented');
      assert(result.implemented.includes('zoneStatus'), 'zoneStatus should be implemented');
    });
  });

  describe('Mock Device Factory', function() {
    it('should create a motion sensor with correct zone type', function() {
      const sensor = MOCK_DEVICES.motionSensor();
      // Access bound cluster directly (not via ZCL readAttributes)
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
