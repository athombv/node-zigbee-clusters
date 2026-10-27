'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

const { BoundCluster } = require('..');
const DoorLockCluster = require('../lib/clusters/doorLock');
const { createVirtualDevice } = require('./util/virtualDevice');

// Door Lock setWeekDaySchedule is cluster-specific command 0x0B, same id as global Default Response
const SET_WEEK_DAY_SCHEDULE_REQUEST = Buffer.from([
  0x01, 0x05, 0x0b, 0x01, 0x02, 0x00, 0x02, 0x08, 0x00, 0x17, 0x00,
]);

/** Sends `request` to a lock served by `doorLock` and returns what the lock sent back, as hex. */
async function lockAnswersTo(request, doorLock) {
  const { zclNode, frames, settle } = createVirtualDevice({
    endpoints: [{ endpointId: 1, inputClusters: [DoorLockCluster.ID], clusters: { doorLock } }],
  });

  await zclNode.sendFrame(1, DoorLockCluster.ID, request);
  await settle();

  return frames
    .filter(({ from }) => from === 'virtualDevice')
    .map(({ raw }) => raw.toString('hex'));
}

describe('Default Response', function () {
  it('sends the cluster-specific response to a cluster-specific command 0x0B', async function () {
    const answers = await lockAnswersTo(
      SET_WEEK_DAY_SCHEDULE_REQUEST,
      new (class extends BoundCluster {
        async setWeekDaySchedule() {
          return { status: 0 };
        }
      })(),
    );

    assert.deepEqual(answers, ['19050b00']);
  });

  it('sends an error Default Response to an unhandled cluster-specific command 0x0B', async function () {
    const answers = await lockAnswersTo(SET_WEEK_DAY_SCHEDULE_REQUEST, new BoundCluster());

    // Default Response (0x0B) for command 0x0B with any error status; the exact status is not
    // what this test is about
    assert.equal(answers.length, 1);
    assert.match(answers[0], /^18050b0b(?!00)[0-9a-f]{2}$/);
  });

  it('does not respond to a global Default Response', async function () {
    const { virtualDevice, frames, settle } = createVirtualDevice({
      endpoints: [{ endpointId: 1, inputClusters: [DoorLockCluster.ID] }],
    });

    // A stray Default Response without Disable Default Response set, as some devices send
    await virtualDevice.sendFrame(
      1,
      DoorLockCluster.ID,
      Buffer.from([0x08, 0x05, 0x0b, 0x00, 0x00]),
    );
    await settle();

    assert.deepEqual(
      frames.filter(({ from }) => from === 'zclNode'),
      [],
    );
  });
});
