// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');

const { Endpoint, ZCLNode, BoundCluster } = require('..');

const ENDPOINT_ID = 1;
const BASIC_CLUSTER_ID = 0x0000;
const MODEL_ID = 0x0005;
const UNIMPLEMENTED_ID = 0x1234;

const DESCRIPTOR = {
  endpointId: ENDPOINT_ID,
  inputClusters: [BASIC_CLUSTER_ID],
  outputClusters: [],
};

class Basic extends BoundCluster {

  get modelId() {
    return 'Homey Bridge';
  }

}

/** A global Read Attributes request for the given attribute ids. */
function readAttributes(ids, seq) {
  const frame = Buffer.alloc(3 + ids.length * 2);
  frame[0] = 0x00;
  frame[1] = seq;
  frame[2] = 0x00;
  ids.forEach((id, i) => frame.writeUInt16LE(id, 3 + i * 2));
  return frame;
}

describe('Endpoint standalone', function() {
  /** Dispatch through an Endpoint owned by a plain object rather than a ZCLNode. */
  async function viaEndpoint(frame, meta) {
    let sent;
    const endpoint = new Endpoint({
      sendFrame: async (_ep, _cl, f) => {
        sent = f;
      },
    }, DESCRIPTOR);
    endpoint.bind('basic', new Basic());
    await endpoint.handleFrame(BASIC_CLUSTER_ID, frame, meta);
    return sent;
  }

  /** The same dispatch reached the long way, through a ZCLNode. */
  async function viaNode(frame, meta) {
    let sent;
    const shim = {
      endpointDescriptors: [DESCRIPTOR],
      sendFrame: async (_ep, _cl, f) => {
        sent = f;
      },
    };
    const node = new ZCLNode(shim);
    node.endpoints[ENDPOINT_ID].bind('basic', new Basic());
    await shim.handleFrame(ENDPOINT_ID, BASIC_CLUSTER_ID, frame, meta);
    return sent;
  }

  it('needs nothing from its owner but sendFrame', async function() {
    // The point of exporting Endpoint: a device serving bound clusters is not a peer, so it should
    // not have to construct a ZCLNode - which exists to model one remote node and bakes that node's
    // address into its own sendFrame.
    const sent = await viaEndpoint(readAttributes([MODEL_ID], 7));

    assert.ok(sent, 'a response should be sent');
    assert.equal(sent.toString('hex'), '180701050000420c486f6d657920427269646765');
  });

  it('dispatches identically to the same endpoint reached through a ZCLNode', async function() {
    for (const [label, ids, seq, meta] of [
      ['implemented', [MODEL_ID], 7, undefined],
      ['unimplemented', [UNIMPLEMENTED_ID], 3, undefined],
      ['mixed', [MODEL_ID, UNIMPLEMENTED_ID], 9, undefined],
      ['group-addressed', [MODEL_ID], 1, { groupId: 0x1234 }],
    ]) {
      const frame = readAttributes(ids, seq);
      const direct = await viaEndpoint(frame, meta);
      const throughNode = await viaNode(frame, meta);
      assert.deepEqual(direct, throughNode, label);
    }
  });

  it('applies the group-addressed suppression itself', async function() {
    // ZCL 2.5.12.2. This lives in Endpoint.handleFrame, so it comes along with the export rather
    // than having to be reimplemented by whoever wires up a server.
    const sent = await viaEndpoint(readAttributes([MODEL_ID], 1), { groupId: 0x1234 });
    assert.equal(sent, undefined);
  });

  it('reports an unimplemented attribute as UNSUPPORTED_ATTRIBUTE', async function() {
    const sent = await viaEndpoint(readAttributes([UNIMPLEMENTED_ID], 3));
    assert.equal(sent[sent.length - 1], 0x86);
  });
});
