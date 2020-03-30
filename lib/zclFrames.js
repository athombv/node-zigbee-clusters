'use strict';

const { ZCLDataType, ZCLDataTypes, ZCLStruct } = require('./zclTypes');

const ZCLFrameControlBitmap = ZCLDataTypes.map8('clusterSpecific', null, 'manufacturerSpecific', 'directionToClient', 'disableDefaultResponse');

const ZCLStandardHeader = ZCLStruct('ZCLStandardHeader', {
  frameControl: ZCLFrameControlBitmap,
  trxSequenceNumber: ZCLDataTypes.data8,
  cmdId: ZCLDataTypes.data8,
  data: ZCLDataTypes.buffer,
});

const ZCLMfgSpecificHeader = ZCLStruct('ZCLMfgSpecificHeader', {
  frameControl: ZCLFrameControlBitmap,
  manufacturerId: ZCLDataTypes.uint16,
  trxSequenceNumber: ZCLDataTypes.data8,
  cmdId: ZCLDataTypes.data8,
  data: ZCLDataTypes.buffer,
});

const ZCLAttributeDataRecord = (withStatus, attributes) => new ZCLDataType(NaN, 'attributeRecord', -3, ((buf, v, i) => {
  const startByte = i;
  i += ZCLDataTypes.uint16.toBuffer(buf, v.id, i);
  if (withStatus) {
    i += ZCLDataTypes.enum8Status.toBuffer(buf, v.status, i);
  }
  if (!withStatus || v.status === 'SUCCESS') {
    i += ZCLDataTypes.uint8.toBuffer(buf, attributes[v.id].type.id, i);
    i += attributes[v.id].type.toBuffer(buf, v.value, i);
  }
  return i - startByte;
}), function fromBuf(buf, i, returnLength) {
  i = i || 0;
  const startByte = i;
  const res = {};
  if (buf.length >= i + Math.abs(this.length)) {
    res.id = ZCLDataTypes.uint16.fromBuffer(buf, i);
    i += ZCLDataTypes.uint16.length;

    if (withStatus) {
      res.status = ZCLDataTypes.enum8Status.fromBuffer(buf, i);
      i += ZCLDataTypes.enum8Status.length;
    }

    if (!withStatus || res.status === 'SUCCESS') {
      const dataTypeId = ZCLDataTypes.uint8.fromBuffer(buf, i);
      i += ZCLDataTypes.uint8.length;

      const DataType = attributes[res.id]
        ? attributes[res.id].type
        : Object.values(ZCLDataTypes).find(type => type && type.id === dataTypeId);
      if (!DataType) throw new TypeError(`Invalid Type for Attribute: ${res.id}`);

      if (attributes[res.id]) {
        res.name = attributes[res.id].name || `unknown_attr_${res.id}`;
      }

      const entry = DataType.fromBuffer(buf, i, true);
      if (DataType.length > 0) {
        i += DataType.length;
        res.value = entry;
      } else {
        res.value = entry.result;
        i += entry.length;
      }
    }
  }
  if (returnLength) {
    return { result: res, length: i - startByte };
  }
  return res;
});

module.exports = {
  ZCLStandardHeader,
  ZCLMfgSpecificHeader,
  ZCLAttributeDataRecord,
};
