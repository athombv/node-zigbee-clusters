'use strict';

// Xiaomi devices report state in Basic attribute 0xff01: a string (0x42) on the wire holding
// id/type/value records. A cluster that declares its own type for it must get that type used.

const { describe, it, mock } = require('node:test');
const assert = require('node:assert');

const { ZCLDataTypes, ZCLDataType } = require('../lib/zclTypes');
const Cluster = require('../lib/Cluster');
const BasicCluster = require('../lib/clusters/basic');
const { createVirtualDevice } = require('./util');

const LIFELINE_RECORDS = {
  1: 'batteryVoltage',
  3: 'cpuTemperature',
  4: 'unk_4',
  6: 'txCount',
  100: 'state0',
};

// One record: id (uint8), data type (uint8), value of that type. At least 3 bytes, no ZCL id.
const XiaomiLifelineDataRecord = new ZCLDataType(
  NaN,
  'XiaomiLifelineDataRecord',
  -3,
  () => {
    throw new Error('not_supported');
  },
  (buf, i = 0, returnLength) => {
    const start = i;
    const id = ZCLDataTypes.uint8.fromBuffer(buf, i);
    const dataTypeId = ZCLDataTypes.uint8.fromBuffer(buf, i + 1);
    i += 2;

    const DataType = Object.values(ZCLDataTypes).find((type) => type && type.id === dataTypeId);
    if (!DataType) throw new TypeError(`Invalid Type for Attribute: ${id}`);

    const entry = DataType.fromBuffer(buf, i, true);
    let value;
    if (DataType.length > 0) {
      value = entry;
      i += DataType.length;
    } else {
      value = entry.result;
      i += entry.length;
    }

    const result = { name: LIFELINE_RECORDS[id] || `unknown_attr_${id}`, value };
    return returnLength ? { result, length: i - start } : result;
  },
);

// The records, wrapped in the length-prefixed string the device puts on the wire.
const XiaomiLifelineDataRecordArray = new ZCLDataType(
  NaN,
  'XiaomiLifelineDataRecordArray',
  -1,
  () => {
    throw new Error('not_supported');
  },
  (buf, i, returnLength) => {
    const { result: records, length } = ZCLDataTypes.buffer8.fromBuffer(buf, i, true);
    const result = Object.fromEntries(
      ZCLDataTypes.Array0(XiaomiLifelineDataRecord)
        .fromBuffer(records, 0)
        .map(({ name, value }) => [name, value]),
    );
    return returnLength ? { result, length } : result;
  },
);

class XiaomiBasicCluster extends BasicCluster {
  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      xiaomiLifeline: { id: 0xff01, type: XiaomiLifelineDataRecordArray },
    };
  }
}

/** A string attribute: data type 0x42, length byte, then the bytes. */
const string = (bytes) => Buffer.from([0x42, bytes.length, ...bytes]);

// One lifeline record per line: id, data type, little-endian value
const LIFELINE = Buffer.from([
  ...[0x01, 0x21, 0xb8, 0x0b], // batteryVoltage, uint16 3000
  ...[0x03, 0x28, 0x16], // cpuTemperature, int8 22
  ...[0x04, 0x21, 0xd2, 0x04], // unk_4, uint16 1234
  ...[0x06, 0x24, 0x70, 0x11, 0x01, 0x00, 0x00], // txCount, uint40 70000
  ...[0x08, 0x21, 0x00, 0x01], // no name in the table, uint16 256
  ...[0x64, 0x10, 0x01], // state0, bool true
]);

// An attribute report shaped like the ones Xiaomi devices send: manufacturer specific with
// Xiaomi's code 0x115f, modelId first, then 0xff01 as a string holding the records.
const XIAOMI_REPORT = Buffer.concat([
  Buffer.from([0x1c, 0x5f, 0x11, 0x01, 0x0a]), // frame control, manufacturer, TSN, report
  Buffer.from([0x05, 0x00]), // modelId
  string(Buffer.from('lumi.virtual.sensor')),
  Buffer.from([0x01, 0xff]), // 0xff01
  string(LIFELINE),
]);

describe('Xiaomi lifeline attribute', function () {
  it('should decode a report with the type the cluster declares, not the one on the wire', async function (t) {
    Cluster.addCluster(XiaomiBasicCluster);
    t.after(() => Cluster.addCluster(BasicCluster));

    const { zclNode, virtualDevice, frames, settle } = createVirtualDevice({
      endpoints: [{ endpointId: 1, inputClusters: [BasicCluster.ID] }],
    });
    const { basic } = zclNode.endpoints[1].clusters;
    const onModelId = mock.fn();
    const onLifeline = mock.fn();
    basic.on('attr.modelId', onModelId);
    basic.on('attr.xiaomiLifeline', onLifeline);

    await virtualDevice.sendFrame(1, BasicCluster.ID, XIAOMI_REPORT);
    await settle();

    assert.deepStrictEqual(onModelId.mock.calls[0].arguments[0], 'lumi.virtual.sensor');
    assert.deepStrictEqual(onLifeline.mock.calls[0].arguments[0], {
      batteryVoltage: 3000,
      cpuTemperature: 22,
      unk_4: 1234,
      txCount: 70000,
      unknown_attr_8: 256,
      state0: true,
    });
    // Disable Default Response is set, so the node does not answer
    assert.deepStrictEqual(
      frames.map(({ from }) => from),
      ['virtualDevice'],
    );
  });
});
