'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const { createMockNode } = require('./util');

const ON_OFF = OnOffCluster.ATTRIBUTES.onOff.id;
const ON_TIME = OnOffCluster.ATTRIBUTES.onTime.id;

/** Encode read-attribute status records the way a remote cluster would answer. */
function encode(records) {
  const buf = Buffer.alloc(255);
  const len = OnOffCluster.attributeArrayStatusDataType.toBuffer(buf, records, 0);
  return buf.slice(0, len);
}

/**
 * Mock node whose bound onOff cluster answers every read with `answer(requestedIds)`, so a test
 * can decide what the remote side reports back.
 */
function nodeAnswering(answer) {
  const node = createMockNode({
    loopback: true,
    endpoints: [{ endpointId: 1, inputClusters: [OnOffCluster.ID] }],
  });

  node.endpoints[1].bind(
    'onOff',
    new (class extends BoundCluster {
      async readAttributes({ attributes }) {
        return { attributes: encode(answer(attributes)) };
      }
    })(),
  );

  return node;
}

describe('Cluster readAttributes', function () {
  it('reads what it asked for across several responses', async function () {
    const requests = [];

    const node = nodeAnswering((ids) => {
      requests.push([...ids]);
      // Answer one attribute at a time, as a device splitting a response over several frames does.
      const id = ids[0];
      return [{ id, status: 'SUCCESS', value: id === ON_OFF ? true : 5 }];
    });

    const result = await node.endpoints[1].clusters.onOff.readAttributes(['onOff', 'onTime']);

    assert.deepStrictEqual(requests, [[ON_OFF, ON_TIME], [ON_TIME]]);
    assert.deepStrictEqual(result, { onOff: true, onTime: 5 });
  });

  it('stops asking when a response holds none of the requested attributes', async function () {
    let reads = 0;

    const node = nodeAnswering(() => {
      reads++;
      // Never answers onOff, only an attribute that was not asked for.
      return [{ id: ON_TIME, status: 'SUCCESS', value: 5 }];
    });

    const result = await node.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.strictEqual(reads, 1);
    assert.deepStrictEqual(result, {});
  });

  it('keeps attributes that were not asked for out of the result', async function () {
    const node = nodeAnswering(() => [
      { id: ON_OFF, status: 'SUCCESS', value: true },
      { id: ON_TIME, status: 'SUCCESS', value: 5 },
    ]);

    const result = await node.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.deepStrictEqual(result, { onOff: true });
  });

  it('stops on a response that holds no attributes at all', async function () {
    let reads = 0;

    const node = nodeAnswering(() => {
      reads++;
      return [];
    });

    const result = await node.endpoints[1].clusters.onOff.readAttributes(['onOff']);

    assert.strictEqual(reads, 1);
    assert.deepStrictEqual(result, {});
  });
});
