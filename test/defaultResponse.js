'use strict';

const assert = require('assert');

const { Endpoint, BoundCluster } = require('..');
const DoorLockCluster = require('../lib/clusters/doorLock');

// Door Lock setWeekDaySchedule is cluster-specific command 0x0B, same id as global Default Response
const SET_WEEK_DAY_SCHEDULE_REQUEST = Buffer.from([
  0x01, 0x05, 0x0b, 0x01, 0x02, 0x00, 0x02, 0x08, 0x00, 0x17, 0x00,
]);

function createEndpoint() {
  const sentFrames = [];
  const endpoint = new Endpoint(
    {
      sendFrame: async (_endpointId, _clusterId, frame) => {
        sentFrames.push(frame.toString('hex'));
      },
    },
    { endpointId: 1, inputClusters: [DoorLockCluster.ID], outputClusters: [] },
  );
  return { endpoint, sentFrames };
}

describe('Default Response', function () {
  it('sends the cluster-specific response to a cluster-specific command 0x0B', async function () {
    const { endpoint, sentFrames } = createEndpoint();
    endpoint.bind(
      'doorLock',
      new (class extends BoundCluster {
        async setWeekDaySchedule() {
          return { status: 0 };
        }
      })(),
    );

    await endpoint.handleFrame(DoorLockCluster.ID, SET_WEEK_DAY_SCHEDULE_REQUEST);

    assert.deepEqual(sentFrames, ['19050b00']);
  });

  it('sends an error Default Response to an unhandled cluster-specific command 0x0B', async function () {
    const { endpoint, sentFrames } = createEndpoint();
    endpoint.bind('doorLock', new BoundCluster());

    await endpoint.handleFrame(DoorLockCluster.ID, SET_WEEK_DAY_SCHEDULE_REQUEST);
    // The error response is sent without awaiting, let it flush
    await new Promise(setImmediate);

    // Default Response (0x0B) for command 0x0B with any error status; the exact status is not
    // what this test is about
    assert.equal(sentFrames.length, 1);
    assert.match(sentFrames[0], /^18050b0b(?!00)[0-9a-f]{2}$/);
  });

  it('does not respond to a global Default Response', async function () {
    const { endpoint, sentFrames } = createEndpoint();

    await endpoint.handleFrame(DoorLockCluster.ID, Buffer.from([0x08, 0x05, 0x0b, 0x00, 0x00]));
    await new Promise(setImmediate);

    assert.deepEqual(sentFrames, []);
  });
});
