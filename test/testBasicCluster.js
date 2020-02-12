const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
require('../lib/clusters/basic');

describe('basicCluster', () => {
    let node;
    let basic;
    before(() => {
        node = require('./loopbackNode')
        ([
            {
                endpointId: 1,
                inputClusters: [0],
            }
        ]);
        basic = node.endpoints[1].clusters['basic'];
    });
    it('should fail for unbound cluster', async () => {
        try {
            await basic.configureReporting({
                zclVersion: {
                    minInterval: 1234,
                    maxInterval: 4321
                }
            });
        } catch(e) {
            return;
        }
        throw new Error('didn\'t throw');
    });

    it('should fail for unimplemented command', async () => {
        node.endpoints[1].bind('basic', new BoundCluster());

        try {
            await basic.factoryReset();
        } catch(e) {
            return;
        }
        throw new Error('didn\'t throw');
    });

    it('should invoke command', async () => {
        node.endpoints[1].bind('basic', new class extends BoundCluster {
            async factoryReset() { }
        });

        await basic.factoryReset();
    });

    it('should configure reporting', async () => {
        node.endpoints[1].bind('basic', new class extends BoundCluster {
            async configureReporting({reports}) {
                assert.equal(reports.length, 1, 'exactly 1 report');
            }
        });

        await basic.configureReporting({
            zclVersion: {
                minInterval: 1234,
                maxInterval: 4321
            }
        });
    });

    it('should read attributes', async () => {
        node.endpoints[1].bind('basic', new class extends BoundCluster {
            constructor() {
                super();
                this.dateCode = "1234"
            }
            get modelId() {
                return "test";
            }
            get manufacturerName() {
                return "Athom";
            }
        });

        const res = await basic.readAttributes('modelId', 'manufacturerName', 'clusterRevision', 'zclVersion', 'dateCode');
        assert.equal(res.modelId, 'test', 'modelId should be test');
        assert.equal(res.manufacturerName, 'Athom', 'manufacturerName should be test');
        assert.equal(res.clusterRevision, 1, 'clusterRevision should be test');
        assert.equal(res.zclVersion, undefined, 'zclVersion should not be present');
        assert.equal(res.dateCode, '1234', 'dateCode should not be present');
        
    });

    it('should write attributes', async () => {
        node.endpoints[1].bind('basic', new class extends BoundCluster {
            get modelId() {
                return "test";
            }
            get manufacturerName() {
                return "Athom";
            }
            set modelId(val) {
                assert.equal(val, 'test1');
            }
        });

        await basic.writeAttributes({
            modelId: 'test1'
        });
    });

    it('should discover attributes', async () => {
        node.endpoints[1].bind('basic', new class extends BoundCluster {
            get modelId() {
                return "test";
            }
            get manufacturerName() {
                return "Athom";
            }
            set modelId(val) {
                assert.equal(val, 'test1');
            }
        });

        const attrs = await basic.discoverAttributes();
        ['modelId', 'manufacturerName'].forEach(a => {
            assert(attrs.includes(a), a+' is missing');
        });
    });

    it('should discover received commands', async () => {
        node.endpoints[1].bind('basic', new class extends BoundCluster {
            async factoryReset() {

            }
        });
        const cmds = await basic.discoverCommandsReceived();
        assert(cmds.includes('factoryReset'));
    });
});
