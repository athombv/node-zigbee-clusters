'use strict';

const assert = require('assert');

const { Endpoint, BoundCluster } = require('..');

const BASIC_CLUSTER_ID = 0x0000;
const MODEL_ID = 0x0005;

class Basic extends BoundCluster {

  get modelId() {
    return 'Homey Bridge';
  }

}

describe('Endpoint standalone', function() {
  it('serves bound clusters with nothing but a sendFrame owner', async function() {
    // The whole point of the export: a device answering incoming commands is not a peer, so it
    // should not have to construct a ZCLNode - which models one remote node and bakes that node's
    // address into its own sendFrame. Endpoint touches its owner in exactly one place (sendFrame),
    // so a plain object is enough. If that ever stops being true, this fails.
    let sent;
    const endpoint = new Endpoint(
      {
        sendFrame: async (_endpointId, _clusterId, frame) => {
          sent = frame;
        },
      },
      { endpointId: 1, inputClusters: [BASIC_CLUSTER_ID], outputClusters: [] },
    );
    endpoint.bind('basic', new Basic());

    const request = Buffer.from([0x00, 0x07, 0x00, MODEL_ID, 0x00]);
    await endpoint.handleFrame(BASIC_CLUSTER_ID, request);

    assert.equal(sent.toString('hex'), '180701050000420c486f6d657920427269646765');
  });
});
