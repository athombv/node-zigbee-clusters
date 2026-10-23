'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const OnOffCluster = require('../lib/clusters/onOff');
const { createMockNode } = require('./util');
const { ZCLStandardHeader } = require('../lib/zclFrames');

describe('Attribute report', function () {
  it('should emit the transaction sequence number with the attribute value', function (t, done) {
    const node = createMockNode({
      endpoints: [
        {
          endpointId: 1,
          inputClusters: [OnOffCluster.ID],
        },
      ],
    });

    node.endpoints[1].clusters.onOff.on('attr.onOff', (value, meta) => {
      assert.strictEqual(value, true);
      // Only whitelisted fields, not the stack's frame meta
      assert.deepStrictEqual(meta, { transactionSequenceNumber: 42 });
      done();
    });

    const frame = new ZCLStandardHeader();
    frame.cmdId = 0x0a; // reportAttributes
    frame.trxSequenceNumber = 42;
    frame.frameControl.directionToClient = true;
    // attributeId 0x0000 (onOff), dataType 0x10 (bool), value true
    frame.data = Buffer.from([0x00, 0x00, 0x10, 0x01]);

    node.handleFrame(1, OnOffCluster.ID, frame.toBuffer(), { dstEndpoint: 1, linkQuality: 200 });
  });
});
