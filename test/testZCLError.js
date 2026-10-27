'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const LevelControlCluster = require('../lib/clusters/levelControl');
const IasZoneCluster = require('../lib/clusters/iasZone');
const { ZCLError } = require('../lib/util');
const { createVirtualDevice, createSingleClusterDevice, frameToClient } = require('./util');

const SET_ON_CMD_ID = OnOffCluster.COMMANDS.setOn.id;
const DEFAULT_RESPONSE_CMD_ID = 0x0b;

/** A device whose setOn handler throws `error`. */
function onOffDeviceThrowing(error) {
  return createSingleClusterDevice(
    OnOffCluster,
    new (class extends BoundCluster {
      async setOn() {
        throw error;
      }
    })(),
  );
}

/** The single Default Response the virtual device sent, as [command id it answers, status]. */
function deviceDefaultResponse(frames) {
  const responses = frames.filter(({ from }) => from === 'virtualDevice');
  assert.strictEqual(responses.length, 1);
  assert.strictEqual(responses[0].frame.cmdId, DEFAULT_RESPONSE_CMD_ID);
  return [...responses[0].frame.data];
}

/** Has the device send a cluster-specific server-to-client frame; returns the node's answer. */
async function nodeAnswerTo(clusterId, cmdId, data, inputClusters = [OnOffCluster.ID]) {
  const { virtualDevice, frames, settle } = createVirtualDevice({
    endpoints: [{ endpointId: 1, inputClusters }],
  });
  const frame = frameToClient({ cmdId, data, clusterSpecific: true, trxSequenceNumber: 1 });
  await virtualDevice.sendFrame(1, clusterId, frame);
  await settle();

  const answers = frames.filter(({ from }) => from === 'zclNode');
  assert.strictEqual(answers.length, 1);
  assert.strictEqual(answers[0].frame.cmdId, DEFAULT_RESPONSE_CMD_ID);
  return [...answers[0].frame.data];
}

describe('ZCLError handling', function () {
  // ZCL status bytes from the spec, not from our own status table
  for (const [description, error, status, statusByte] of [
    ['a ZCLError', new ZCLError('NOT_AUTHORIZED'), 'NOT_AUTHORIZED', 0x7e],
    ['a ZCLError', new ZCLError('INVALID_VALUE'), 'INVALID_VALUE', 0x87],
    ['a ZCLError', new ZCLError('INSUFFICIENT_SPACE'), 'INSUFFICIENT_SPACE', 0x89],
    ['a generic Error', new Error('something went wrong'), 'FAILURE', 0x01],
  ]) {
    it(`should answer ${status} (0x${statusByte.toString(16)}) when BoundCluster throws ${description}`, async function () {
      const { zclNode, frames } = onOffDeviceThrowing(error);

      await assert.rejects(zclNode.endpoints[1].clusters.onOff.setOn(), { message: status });

      assert.deepStrictEqual(deviceDefaultResponse(frames), [SET_ON_CMD_ID, statusByte]);
    });
  }

  it('should send SUCCESS status byte when ZCLError("SUCCESS") is thrown', async function () {
    const { zclNode, frames } = onOffDeviceThrowing(new ZCLError('SUCCESS'));

    // A SUCCESS default response resolves the command
    await zclNode.endpoints[1].clusters.onOff.setOn();

    assert.deepStrictEqual(deviceDefaultResponse(frames), [SET_ON_CMD_ID, 0x00]);
  });

  // ZCL R8 2.5.12.2
  it('should send UNSUP_COMMAND (0x81) for a command the BoundCluster does not implement', async function () {
    const { zclNode, frames } = createSingleClusterDevice(OnOffCluster, new BoundCluster());

    await assert.rejects(zclNode.endpoints[1].clusters.onOff.setOn(), {
      message: 'UNSUP_CLUSTER_COMMAND',
    });

    assert.deepStrictEqual(deviceDefaultResponse(frames), [SET_ON_CMD_ID, 0x81]);
  });

  it('should send UNSUP_COMMAND (0x81) for an unknown command id on a client cluster', async function () {
    const answer = await nodeAnswerTo(OnOffCluster.ID, 0x7f, Buffer.alloc(0));
    assert.deepStrictEqual(answer, [0x7f, 0x81]);
  });

  // A known request without a handler is still unsupported; only responses without a pending
  // request are ignored
  it('should send UNSUP_COMMAND (0x81) for a server-to-client request without a handler', async function () {
    const answer = await nodeAnswerTo(
      IasZoneCluster.ID,
      0x00, // zoneStatusChangeNotification
      Buffer.from([0x01, 0x00, 0x00, 0x01, 0x00, 0x00]),
      [IasZoneCluster.ID],
    );
    assert.deepStrictEqual(answer, [0x00, 0x81]);
  });

  it('should send UNSUPPORTED_CLUSTER (0xc3) for a server-to-client frame on a cluster the endpoint lacks', async function () {
    const answer = await nodeAnswerTo(LevelControlCluster.ID, 0x00, Buffer.alloc(0));
    assert.deepStrictEqual(answer, [0x00, 0xc3]);
  });

  it('should send UNSUPPORTED_CLUSTER (0xc3) when the endpoint has no binding for the cluster', async function () {
    const { zclNode, frames } = createSingleClusterDevice(OnOffCluster);

    await assert.rejects(zclNode.endpoints[1].clusters.onOff.setOn(), {
      message: 'UNSUPPORTED_CLUSTER',
    });

    assert.deepStrictEqual(deviceDefaultResponse(frames), [SET_ON_CMD_ID, 0xc3]);
  });
});
