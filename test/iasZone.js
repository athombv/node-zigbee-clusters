// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const Node = require('../lib/Node');
const { ZCLStandardHeader } = require('../lib/zclFrames');

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
});
