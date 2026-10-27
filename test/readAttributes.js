'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const { createSingleClusterDevice } = require('./util/virtualDevice');

const ON_OFF = OnOffCluster.ATTRIBUTES.onOff.id;
const ON_TIME = OnOffCluster.ATTRIBUTES.onTime.id;

/** A device whose onOff cluster answers every read with the records `answer(requestedIds)`. */
function deviceAnswering(answer) {
  return createSingleClusterDevice(
    OnOffCluster,
    new (class extends BoundCluster {
      async readAttributes({ attributes }) {
        const buf = Buffer.alloc(255);
        const len = OnOffCluster.attributeArrayStatusDataType.toBuffer(buf, answer(attributes), 0);
        return { attributes: buf.subarray(0, len) };
      }
    })(),
  );
}

// The device that only ever answers with unrequested ids is in test/virtualDevice.js.
describe('Cluster readAttributes', function () {
  it('reads what it asked for across several responses', async function () {
    const requests = [];
    const { zclNode } = deviceAnswering((ids) => {
      requests.push([...ids]);
      // One attribute per response, as a device splitting its answer over several frames does.
      const id = ids[0];
      return [{ id, status: 'SUCCESS', value: id === ON_OFF ? true : 5 }];
    });

    const result = await zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff', 'onTime']);

    assert.deepStrictEqual(requests, [[ON_OFF, ON_TIME], [ON_TIME]]);
    assert.deepStrictEqual(result, { onOff: true, onTime: 5 });
  });

  it('keeps attributes that were not asked for out of the result', async function () {
    const { zclNode } = deviceAnswering(() => [
      { id: ON_OFF, status: 'SUCCESS', value: true },
      { id: ON_TIME, status: 'SUCCESS', value: 5 },
    ]);

    const result = await zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.deepStrictEqual(result, { onOff: true });
  });

  it('stops on a response that holds no attributes at all', async function () {
    let reads = 0;
    const { zclNode } = deviceAnswering(() => {
      reads++;
      return [];
    });

    const result = await zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.strictEqual(reads, 1);
    assert.deepStrictEqual(result, {});
  });
});
