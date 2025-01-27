// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const sinon = require('sinon');

let { debug } = require('./util');
const Node = require('../lib/Node');
const BoundCluster = require('../lib/BoundCluster');
const Endpoint = require('../lib/Endpoint');
require('../lib/clusters/basic');
require('../lib/clusters/onOff');

debug = debug.extend('test-node');

const sandbox = sinon.createSandbox();

describe('Node', function() {
  let loopbackNode;
  let receivingNode;
  let sendingNode;
  before(function() {
    // eslint-disable-next-line global-require
    const { loopbackNode: loopbackNodeBuilder } = require('./util');
    loopbackNode = loopbackNodeBuilder([
      {
        endpointId: 1,
        inputClusters: [0],
      },
    ]);
    sendingNode = new Node({
      // Forward frames to receiving node
      sendFrame: (...args) => receivingNode.handleFrame(...args),
      endpointDescriptors: [
        {
          endpointId: 1,
          inputClusters: [0, 6],
        },
      ],
    });
    // Override log id for sending node
    const sendingNodeLog = (...args) => `sending-node:${args.join(':')}`;
    sendingNode.getLogId = sendingNodeLog;
    sendingNode.endpoints[1].getLogId = sendingNodeLog;
    receivingNode = new Node({
      // Forward frames to sending node
      sendFrame: (...args) => sendingNode.handleFrame(...args),
      endpointDescriptors: [
        {
          endpointId: 1,
          inputClusters: [0, 6],
        },
      ],
    });
    // Override log id for receiving node
    const receivingNodeLog = (...args) => `receiving-node:${args.join(':')}`;
    receivingNode.getLogId = receivingNodeLog;
    receivingNode.endpoints[1].getLogId = receivingNodeLog;
  });
  afterEach(function() {
    sandbox.restore();
  });
  it('should fail for unbound cluster', async function() {
    try {
      await loopbackNode.endpoints[1].clusters['basic'].configureReporting({
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
    loopbackNode.endpoints[1].bind('basic', new BoundCluster());

    try {
      await loopbackNode.endpoints[1].clusters['basic'].factoryReset();
    } catch (e) {
      return;
    }
    throw new Error('didn\'t throw');
  });

  it('should invoke command', async function() {
    loopbackNode.endpoints[1].bind('basic', new class extends BoundCluster {

      async factoryReset() {
        debug('factory reset');
      }

    }());

    await loopbackNode.endpoints[1].clusters['basic'].factoryReset();
  });

  it('should configure reporting', async function() {
    loopbackNode.endpoints[1].bind('basic', new class extends BoundCluster {

      async configureReporting({ reports }) {
        assert.equal(reports.length, 1, 'exactly 1 report');
      }

    }());

    await loopbackNode.endpoints[1].clusters['basic'].configureReporting({
      zclVersion: {
        minInterval: 10,
        maxInterval: 4321,
      },
    });
  });

  it('should read attributes', async function() {
    loopbackNode.endpoints[1].bind('basic', new class extends BoundCluster {

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

    const res = await loopbackNode.endpoints[1].clusters['basic'].readAttributes(['modelId', 'manufacturerName', 'clusterRevision', 'zclVersion', 'dateCode']);
    assert.equal(res.modelId, 'test', 'modelId should be test');
    assert.equal(res.manufacturerName, 'Athom', 'manufacturerName should be test');
    assert.equal(res.clusterRevision, 1, 'clusterRevision should be test');
    assert.equal(res.zclVersion, undefined, 'zclVersion should not be present');
    assert.equal(res.dateCode, '1234', 'dateCode should not be present');
  });

  it('should respond with read attribute response when disableDefaultResponse is true', async function() {
    receivingNode.endpoints[1].bind('basic', new class extends BoundCluster {

      get modelId() {
        return 'test';
      }

    }());

    const readAttributesResponse = await sendingNode.endpoints[1].clusters['basic'].readAttributes(['modelId'], { disableDefaultResponse: true });
    assert.equal(readAttributesResponse.modelId, 'test');
  });

  it('should not respond with a default response when disableDefaultResponse is true', async function() {
    receivingNode.endpoints[1].bind('basic', new class extends BoundCluster {

      get modelId() {
        return 'test';
      }

    }());

    const sendingNodeSendFrameSpy = sandbox.spy(sendingNode, 'sendFrame');
    const receivingNodeSendFrameSpy = sandbox.spy(receivingNode, 'sendFrame');

    await sendingNode.endpoints[1].clusters['basic'].readAttributes(['modelId'], { disableDefaultResponse: true });

    // 1 frame sent by sending node, the read attributes command
    assert.equal(sendingNodeSendFrameSpy.callCount, 1);
    // 1 frame sent by receiving node, the read attributes response
    assert.equal(receivingNodeSendFrameSpy.callCount, 1);

    // Parse the received frame
    const frame = Endpoint.parseFrame(receivingNodeSendFrameSpy.getCall(0).args[2]);

    // 0x01 is read attributes response
    assert.equal(frame.cmdId, 1);
  });

  it('should not respond to a default response frame', async function() {
    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      toggle() {
        debug('toggled');
      }

    }());

    const sendingNodeSendFrameSpy = sandbox.spy(sendingNode, 'sendFrame');
    const receivingNodeSendFrameSpy = sandbox.spy(receivingNode, 'sendFrame');

    await sendingNode.endpoints[1].clusters['onOff'].toggle();
    // 1 frame sent by sending node, the toggle command
    assert.equal(sendingNodeSendFrameSpy.callCount, 1);
    // 1 frame sent by receiving node, the toggle command default response
    assert.equal(receivingNodeSendFrameSpy.callCount, 1);

    // Parse the received frame
    const frame = Endpoint.parseFrame(receivingNodeSendFrameSpy.getCall(0).args[2]);

    // 0x01 is read attributes response
    assert.equal(frame.cmdId, 11);
  });

  it('should respond with default response error when frame could not be handled', async function() {
    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {}());

    const sendingNodeHandleFrameSpy = sandbox.spy(sendingNode, 'handleFrame');

    // Execute toggle and expect a failure as the command is not implemented
    await assert.rejects(sendingNode.endpoints[1].clusters['onOff'].toggle(), { message: 'FAILURE' });

    // 1 frame received by sending node, the default response error
    assert.equal(sendingNodeHandleFrameSpy.callCount, 1);

    // Parse the received frame
    const frame = Endpoint.parseFrame(sendingNodeHandleFrameSpy.getCall(0).args[2]);
    assert.equal(frame.cmdId, 0x0B);
    assert.equal(frame.data[1], 0x01); // Error status
  });

  it('should not respond to a group cast frame', async function() {
    const toggledSpy = sandbox.spy();
    receivingNode.endpoints[1].bind('onOff', new class extends BoundCluster {

      toggle() {
        toggledSpy();
      }

    }());

    const receivingNodeSendFrameSpy = sandbox.spy(receivingNode, 'sendFrame');

    // Send toggle command to onOff cluster with group id
    await receivingNode.handleFrame(1, 6, Buffer.from([0x01, 0x01, 0x02]), { groupId: 0x01 });
    assert.equal(toggledSpy.callCount, 1);
    // 0 frames sent by receiving node, no response to group commands
    assert.equal(receivingNodeSendFrameSpy.callCount, 0);
  });

  it('should write attributes', async function() {
    loopbackNode.endpoints[1].bind('basic', new class extends BoundCluster {

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

    await loopbackNode.endpoints[1].clusters['basic'].writeAttributes({
      modelId: 'test1',
    });
  });

  it('should discover attributes', async function() {
    loopbackNode.endpoints[1].bind('basic', new class extends BoundCluster {

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

    const attrs = await loopbackNode.endpoints[1].clusters['basic'].discoverAttributes();
    ['modelId', 'manufacturerName'].forEach(a => {
      assert(attrs.includes(a), `${a} is missing`);
    });
  });

  it('should discover received commands', async function() {
    loopbackNode.endpoints[1].bind('basic', new class extends BoundCluster {

      async factoryReset() {
        debug('factory reset');
      }

    }());
    const cmds = await loopbackNode.endpoints[1].clusters['basic'].discoverCommandsReceived();
    assert(cmds.includes('factoryReset'));
  });
});
