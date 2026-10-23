'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert');
const BoundCluster = require('../lib/BoundCluster');
const IASZoneCluster = require('../lib/clusters/iasZone');
const OTACluster = require('../lib/clusters/ota');
const { createVirtualDevice, frameToClient } = require('./util/virtualDevice');

const DEFAULT_RESPONSE = 0x0b;
const REPORT_ATTRIBUTES = 0x0a;
const MALFORMED_COMMAND = 0x80;
const MAP16 = 0x19;
const ZCL_HEADER_SIZE = 3;

/** The payload, [cmdId, status], of the Default Response `from` sent for `cmdId`. */
function defaultResponse(frames, from, cmdId) {
  const record = frames.find(
    ({ from: sender, frame }) =>
      sender === from &&
      frame.cmdId === DEFAULT_RESPONSE &&
      !frame.frameControl.clusterSpecific &&
      frame.data[0] === cmdId,
  );
  return record && record.frame.data;
}

function createIasZoneSensor() {
  return createVirtualDevice({
    endpoints: [{ endpointId: 1, inputClusters: [IASZoneCluster.ID] }],
  });
}

describe('Malformed frames', function () {
  it('rejects a truncated command to a Cluster', async function () {
    const { zclNode, virtualDevice, frames, settle } = createIasZoneSensor();
    const handler = mock.fn();
    zclNode.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = handler;
    const { id } = IASZoneCluster.COMMANDS.zoneStatusChangeNotification;

    // zoneStatus only, the other 4 of 6 bytes are missing
    const frame = frameToClient({ cmdId: id, clusterSpecific: true, data: Buffer.from([1, 0]) });
    await virtualDevice.sendFrame(1, IASZoneCluster.ID, frame);
    await settle();

    assert.strictEqual(handler.mock.callCount(), 0);
    assert.deepStrictEqual(
      defaultResponse(frames, 'zclNode', id),
      Buffer.from([id, MALFORMED_COMMAND]),
    );
  });

  it('rejects an attribute report with a truncated value', async function () {
    const { zclNode, virtualDevice, frames, settle } = createIasZoneSensor();
    const onZoneStatus = mock.fn();
    zclNode.endpoints[1].clusters.iasZone.on('attr.zoneStatus', onZoneStatus);

    // zoneStatus is map16, only 1 of its 2 value bytes is sent
    const { id } = IASZoneCluster.ATTRIBUTES.zoneStatus;
    const frame = frameToClient({ cmdId: REPORT_ATTRIBUTES, data: Buffer.from([id, 0, MAP16, 1]) });
    await virtualDevice.sendFrame(1, IASZoneCluster.ID, frame);
    await settle();

    assert.strictEqual(onZoneStatus.mock.callCount(), 0);
    assert.deepStrictEqual(
      defaultResponse(frames, 'zclNode', REPORT_ATTRIBUTES),
      Buffer.from([REPORT_ATTRIBUTES, MALFORMED_COMMAND]),
    );
  });

  it('rejects an empty command to a BoundCluster that may skip trailing fields', async function () {
    const { zclNode, virtualDevice, intercept } = createVirtualDevice({
      endpoints: [{ endpointId: 1, outputClusters: [OTACluster.ID] }],
    });
    const handler = mock.fn(async () => ({ status: 'NO_IMAGE_AVAILABLE' }));
    zclNode.endpoints[1].bind(
      'ota',
      new (class extends BoundCluster {
        queryNextImageRequest(...args) {
          return handler(...args);
        }
      })(),
    );
    // Keep the header, drop the payload
    intercept(({ from, raw }) =>
      from === 'virtualDevice' ? [raw.subarray(0, ZCL_HEADER_SIZE)] : undefined,
    );

    await assert.rejects(
      virtualDevice.endpoints[1].clusters.ota.queryNextImageRequest({
        fieldControl: 0,
        manufacturerCode: 0x1234,
        imageType: 1,
        fileVersion: 1,
      }),
      /^Error: MALFORMED_COMMAND$/,
    );
    assert.strictEqual(handler.mock.callCount(), 0);
  });
});
