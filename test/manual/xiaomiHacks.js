'use strict';

const { ZCLDataTypes, ZCLDataType } = require('../../lib/zclTypes');
const Cluster = require('../../lib/Cluster');
const BasicCluster = require('../../lib/clusters/basic');

const attributes = {
  1: { name: 'batteryVoltage' }, // type: ZCLDataTypes.uint16
  3: { name: 'cpuTemperature' }, // type: ZCLDataTypes.int8
  4: { name: 'unk_4' }, // type: ZCLDataTypes.uint16
  5: { name: 'unk_5' }, // type: ZCLDataTypes.uint16
  6: { name: 'txCount' }, // type: ZCLDataTypes.uint40
  10: { name: 'unk_10' }, // type: ZCLDataTypes.uint16
  11: { name: 'illuminance' },
  100: { name: 'state0' },
  101: { name: 'state1' },
  102: { name: 'state2' },
  149: { name: 'consumption' },
  150: { name: 'voltage' },
  151: { name: 'unk_151' },
  152: { name: 'power' },
  153: { name: 'unk_153' },
  154: { name: 'unk_154' },
};

// custom data type parser with dynamic length with minimal 3 bytes, and no declared ZCL id.
const XiaomiLifelineDataRecord = new ZCLDataType(NaN, 'XiaomiLifelineDataRecord', -3, function(buf, v, i) {
  throw new Error('generating xiaomi structs is not implemented');
}, function(buf, i, returnLength) {
  i = i || 0;
  const startByte = i;
  const res = {};
  res.id = ZCLDataTypes.uint8.fromBuffer(buf, i);
  i += ZCLDataTypes.uint8.length;

  const dataTypeId = ZCLDataTypes.uint8.fromBuffer(buf, i);
  i += ZCLDataTypes.uint8.length;

  // eslint-disable-next-line no-mixed-operators
  const DataType = attributes[res.id] && attributes[res.id].type
    // eslint-disable-next-line no-mixed-operators
    || Object.values(ZCLDataTypes).find(type => type && type.id === dataTypeId);
  if (!DataType) throw new TypeError(`Invalid Type for Attribute: ${res.id}`);

  // eslint-disable-next-line no-mixed-operators
  res.name = attributes[res.id] && attributes[res.id].name || `unknown_attr_${res.id}`;

  const entry = DataType.fromBuffer(buf, i, true);
  if (DataType.length > 0) {
    i += DataType.length;
    res.value = entry;
  } else {
    res.value = entry.result;
    i += entry.length;
  }
  if (returnLength) {
    return { result: res, length: i - startByte };
  }
  return res;
});

const XiaomiLifelineDataRecordArray = new ZCLDataType(NaN, 'XiaomiLifelineDataRecordArray', -1, function(buf, v, i) {
  throw new Error('not_supported');
}, function(buf, i, returnLength) {
  // eslint-disable-next-line prefer-const
  let { result, length } = ZCLDataTypes.buffer8.fromBuffer(buf, i, true);
  result = ZCLDataTypes.Array0(XiaomiLifelineDataRecord).fromBuffer(result, 0);
  result = result.reduce((r, { name, value }) => Object.assign(r, { [name]: value }), {});
  if (returnLength) {
    return { result, length };
  }
  return result;
});

class XiaomiHackedBasicCluster extends BasicCluster {

  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      xiaomiLifeline: { id: 0xFF01, type: XiaomiLifelineDataRecordArray },
    };
  }

}

// Replace basic cluster with our patched version
Cluster.addCluster(XiaomiHackedBasicCluster);

// //Demo non-meshdriver zigbee API:
// const OnOffCluster = require('homey-zcl/zcl/onOff');

// node.endpoints[1].basic.on('attr.xiaomiLifeline', (attributes, rawFrame) => {
//     console.log('xiaomi custom state:', attributes.state1);
// })

// const {modelId, dateCode} = await node.endpoints[1].basic.readAttributes('modelId', 'dateCode');
// node.endpoint[1].clusters.basic.configureReporting({
// powerSource: {minInterval: 1234, maxInterval: 4321, minChange: 10}}); //enables reporting

// TODO: invert group commands
// class LocalOnOffCluster {
//     async on() {
//         //binding said on, update attribute
//         this.onOff = true;
//     }

//     async off() {
//         //binding said off
//         this.onOff = false;
//     }

//     async toggle() {
//         //binding said toggle
//         this.onOff = !this.onOff;
//     }
// }

// node.endpoint[1].bind('onOff', new LocalOnOffCluster()); // binds the device+endpoint+cluster
// to us
// node.endpoint[1].unbind('onOff'); //removes a previous binding to us
// node.endpoint[1].bindings.onOff.onOff // returns boolean
// const groupsResponse = await node.endpoints[1].touchlink.getGroups();
// const {groupId} = groupsResponse.groups[0];
//
