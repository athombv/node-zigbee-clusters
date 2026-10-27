'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const { createVirtualDevice, frameToClient } = require('./util');

/** Has an IAS zone sensor send the cluster-specific `cmdId` with `data` to the node under test. */
async function receiveFromSensor(cmdId, data, handlerName) {
  const { zclNode, virtualDevice, settle } = createVirtualDevice({
    endpoints: [{ endpointId: 1, inputClusters: [IASZoneCluster.ID] }],
  });

  let received;
  zclNode.endpoints[1].clusters.iasZone[handlerName] = (payload) => {
    received = payload;
  };

  const frame = frameToClient({ cmdId, data, clusterSpecific: true });
  await virtualDevice.sendFrame(1, IASZoneCluster.ID, frame);
  await settle();

  return received;
}

describe('IAS Zone', function () {
  it('should receive onZoneEnrollRequest', async function () {
    const data = await receiveFromSensor(
      IASZoneCluster.COMMANDS.zoneEnrollRequest.id,
      Buffer.from([0x1d, 0x02, 0x15, 0x10]),
      'onZoneEnrollRequest',
    );

    assert.strictEqual(data.zoneType, 'keypad');
    assert.strictEqual(data.manufacturerCode, 4117);
  });

  it('should send zoneEnrollResponse', async function () {
    const { zclNode, virtualDevice } = createVirtualDevice({
      endpoints: [{ endpointId: 1, inputClusters: [IASZoneCluster.ID] }],
    });

    let receivedData = null;
    virtualDevice.endpoints[1].bind(
      'iasZone',
      new (class extends BoundCluster {
        async zoneEnrollResponse(data) {
          receivedData = data;
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.iasZone.zoneEnrollResponse({
      enrollResponseCode: 'success',
      zoneId: 10,
    });

    assert.strictEqual(receivedData.enrollResponseCode, 'success');
    assert.strictEqual(receivedData.zoneId, 10);
  });

  it('should receive zoneStatusChangeNotification', async function () {
    const data = await receiveFromSensor(
      IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id,
      Buffer.from([0x10, 0x00, 0x00, 0x0a, 0x6c, 0x00]),
      'onZoneStatusChangeNotification',
    );

    assert.strictEqual(data.zoneStatus.supervisionReports, true);
    assert.strictEqual(data.extendedStatus, 0);
    assert.strictEqual(data.zoneId, 10);
    assert.strictEqual(data.delay, 108);
  });
});
