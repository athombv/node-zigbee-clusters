// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const { loopbackNode } = require('./util');
const { ZCLStandardHeader } = require('../lib/zclFrames');

describe('Outgoing only commands', function() {
  let node;
  let endpoint;
  let iasZone;

  before(function() {
    node = loopbackNode([
      {
        endpointId: 1,
        inputClusters: [IASZoneCluster.ID],
      },
    ]);
    endpoint = node.endpoints[1];
    iasZone = endpoint.clusters[IASZoneCluster.NAME];
  });

  it('should emit the correct incoming command', function(done) {
    const commandData = {
      zoneStatus: ['alarm1'],
      extendedStatus: 0,
      zoneId: 1,
      delay: 0,
    };

    endpoint.bind(IASZoneCluster.NAME, new class extends BoundCluster {

      async zoneStatusChangeNotification(payload) {
        assert.deepStrictEqual({
          ...payload,
          zoneStatus: payload.zoneStatus.getBits(),
        }, commandData);
        done();
      }

    }());

    iasZone.zoneStatusChangeNotification(commandData);
  });

  it('should not execute outgoing commands', function(done) {
    const commandData = {
      enrollResponseCode: 'success',
      zoneId: 1,
    };

    endpoint.bind(IASZoneCluster.NAME, new class extends BoundCluster {

      async zoneStatusChangeNotification() {
        // This needs to be triggered from the loopback node as the zone enroll response is outgoing only
        done();
      }

      async zoneEnrollResponse(payload) {
        throw new Error('Should not be triggered');
      }

    }());

    iasZone.zoneEnrollResponse(commandData);
  });

  it('should select correct incoming command and emit matching event', function(done) {
    iasZone.on('zoneStatusChangeNotification', payload => {
      assert.deepStrictEqual({ ...payload, zoneStatus: payload.zoneStatus.getBits() }, {
        zoneStatus: ['alarm1', 'tamper'],
        extendedStatus: 0,
        zoneId: 234,
        delay: 0,
      });
      done();
    });

    const frame = new ZCLStandardHeader();
    frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
    frame.frameControl.directionToClient = true;
    frame.frameControl.clusterSpecific = true;
    frame.data = Buffer.from([0x05, 0x00, 0x00, 0xEA, 0x00, 0x00]);

    endpoint.handleZCLFrame(
      IASZoneCluster.ID,
      frame,
    );
  });
});
