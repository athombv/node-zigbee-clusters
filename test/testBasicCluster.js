// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');

let { debug } = require('./util');
const BoundCluster = require('../lib/BoundCluster');
require('../lib/clusters/basic');

debug = debug.extend('test-cluster-basic');

describe('basicCluster', function() {
  let node;
  let basic;
  before(function() {
    // eslint-disable-next-line global-require
    const { loopbackNode } = require('./util');
    node = loopbackNode([
      {
        endpointId: 1,
        inputClusters: [0],
      },
    ]);
    basic = node.endpoints[1].clusters['basic'];
  });
  it('should fail for unbound cluster', async function() {
    try {
      await basic.configureReporting({
        zclVersion: {
          minInterval: 1234,
          maxInterval: 4321,
        },
      });
    } catch (e) {
      return;
    }
    throw new Error('didn\'t throw');
  });

  it('should fail for unimplemented command', async function() {
    node.endpoints[1].bind('basic', new BoundCluster());

    try {
      await basic.factoryReset();
    } catch (e) {
      return;
    }
    throw new Error('didn\'t throw');
  });

  it('should invoke command', async function() {
    node.endpoints[1].bind('basic', new class extends BoundCluster {

      async factoryReset() {
        debug('factory reset');
      }

    }());

    await basic.factoryReset();
  });

  it('should configure reporting', async function() {
    node.endpoints[1].bind('basic', new class extends BoundCluster {

      async configureReporting({ reports }) {
        assert.equal(reports.length, 1, 'exactly 1 report');
      }

    }());

    await basic.configureReporting({
      zclVersion: {
        minInterval: 10,
        maxInterval: 4321,
      },
    });
  });

  it('should read attributes', async function() {
    node.endpoints[1].bind('basic', new class extends BoundCluster {

      constructor() {
        super();
        this.dateCode = '1234';
      }

      get modelId() {
        return 'test';
      }

      get manufacturerName() {
        return 'Athom';
      }

    }());

    const res = await basic.readAttributes('modelId', 'manufacturerName', 'clusterRevision', 'zclVersion', 'dateCode');
    assert.equal(res.modelId, 'test', 'modelId should be test');
    assert.equal(res.manufacturerName, 'Athom', 'manufacturerName should be test');
    assert.equal(res.clusterRevision, 1, 'clusterRevision should be test');
    assert.equal(res.zclVersion, undefined, 'zclVersion should not be present');
    assert.equal(res.dateCode, '1234', 'dateCode should not be present');
  });

  it('should write attributes', async function() {
    node.endpoints[1].bind('basic', new class extends BoundCluster {

      get modelId() {
        return 'test';
      }

      get manufacturerName() {
        return 'Athom';
      }

      set modelId(val) {
        assert.equal(val, 'test1');
      }

    }());

    await basic.writeAttributes({
      modelId: 'test1',
    });
  });

  it('should discover attributes', async function() {
    node.endpoints[1].bind('basic', new class extends BoundCluster {

      get modelId() {
        return 'test';
      }

      get manufacturerName() {
        return 'Athom';
      }

      set modelId(val) {
        assert.equal(val, 'test1');
      }

    }());

    const attrs = await basic.discoverAttributes();
    ['modelId', 'manufacturerName'].forEach(a => {
      assert(attrs.includes(a), `${a} is missing`);
    });
  });

  it('should discover received commands', async function() {
    node.endpoints[1].bind('basic', new class extends BoundCluster {

      async factoryReset() {
        debug('factory reset');
      }

    }());
    const cmds = await basic.discoverCommandsReceived();
    assert(cmds.includes('factoryReset'));
  });
});
