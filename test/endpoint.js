'use strict';

const assert = require('assert');

require('../lib/clusters/basic');
require('../lib/clusters/onOff');
require('../lib/clusters/levelControl');
require('../lib/clusters/colorControl');

describe('Endpoint', function() {
  let node;
  before(function() {
    // eslint-disable-next-line global-require
    const { loopbackNode } = require('./util');
    node = loopbackNode([
      {
        endpointId: 1,
        inputClusters: [0, 6],
      },
      {
        endpointId: 19,
        inputClusters: [8, 768],
      },
    ]);
  });
  it('Endpoint#hasInputCluster should return true for a match', async function() {
    assert(node.endpoints[19].hasInputCluster('colorControl'));
    assert(node.endpoints[19].hasInputCluster('levelControl'));
    assert(node.endpoints[1].hasInputCluster('basic'));
    assert(node.endpoints[1].hasInputCluster('onOff'));
  });

  it('Endpoint#hasInputCluster should return false for a mismatch', async function() {
    assert.strictEqual(false, node.endpoints[19].hasInputCluster('basic'));
    assert.strictEqual(false, node.endpoints[19].hasInputCluster('onOff'));
    assert.strictEqual(false, node.endpoints[1].hasInputCluster('levelControl'));
    assert.strictEqual(false, node.endpoints[1].hasInputCluster('colorControl'));
  });
});
