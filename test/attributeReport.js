'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert');
const OnOffCluster = require('../lib/clusters/onOff');
const { createVirtualDevice, frameToClient } = require('./util');

describe('Attribute report', function () {
  it('should emit the transaction sequence number with the attribute value', async function () {
    const { zclNode, virtualDevice, settle } = createVirtualDevice({
      endpoints: [{ endpointId: 1, inputClusters: [OnOffCluster.ID] }],
    });
    const onOnOff = mock.fn();
    zclNode.endpoints[1].clusters.onOff.on('attr.onOff', onOnOff);

    const report = frameToClient({
      cmdId: 0x0a, // reportAttributes
      trxSequenceNumber: 42,
      // attributeId 0x0000 (onOff), dataType 0x10 (bool), value true
      data: Buffer.from([0x00, 0x00, 0x10, 0x01]),
    });
    await virtualDevice.sendFrame(1, OnOffCluster.ID, report, {
      dstEndpoint: 1,
      linkQuality: 200,
    });
    await settle();

    // Only whitelisted fields, not the stack's frame meta
    assert.deepStrictEqual(
      onOnOff.mock.calls.map((call) => call.arguments),
      [[true, { transactionSequenceNumber: 42 }]],
    );
  });
});
