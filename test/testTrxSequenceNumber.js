'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

const BoundCluster = require('../lib/BoundCluster');
const BasicCluster = require('../lib/clusters/basic');
const OnOffCluster = require('../lib/clusters/onOff');
const { createVirtualDevice } = require('./util/virtualDevice');

describe('Transaction sequence number', function () {
  it('should share one counter across endpoints and clusters', async function () {
    const { zclNode, frames } = createVirtualDevice({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
          clusters: {
            onOff: new (class extends BoundCluster {
              toggle() {}
            })(),
          },
        },
        { endpointId: 2, inputClusters: [BasicCluster.ID] },
      ],
    });

    await zclNode.endpoints[1].clusters.onOff.toggle();
    await zclNode.endpoints[2].clusters.basic.factoryReset(undefined, { waitForResponse: false });
    await zclNode.endpoints[1].clusters.onOff.toggle();

    const sent = frames
      .filter(({ from }) => from === 'zclNode')
      .map(({ frame }) => frame.trxSequenceNumber);
    const [first] = sent;
    assert.deepStrictEqual(sent, [first, (first + 1) % 256, (first + 2) % 256]);
  });

  it('should start at a random value and wrap around', function (t) {
    t.mock.method(Math, 'random', () => 0.999);
    const { zclNode } = createVirtualDevice({ endpoints: [] });

    assert.strictEqual(zclNode.nextSeqNr(), 0);
    assert.strictEqual(zclNode.nextSeqNr(), 1);
  });
});
