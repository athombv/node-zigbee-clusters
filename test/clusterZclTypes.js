const {ZCLStandardHeader, ZCLAttributeStatusDataRecord} = require('../lib/zclFrames');
const {ZCLDataTypes} = require('../lib/zclTypes');

const AttributeDataRecordArray = ZCLDataTypes.Array0(ZCLAttributeStatusDataRecord);

const data = [{
    id: 4,
    status: 'SUCCESS',
    dataType: ZCLDataTypes.uint16,
    data: 1234,
},{
    id: 5,
    status: 'FAILURE',
},{
    id: 6,
    status: 'SUCCESS',
    dataType: ZCLDataTypes.string,
    data: "Test1234",
},{
    id: 7,
    status: 'SUCCESS',
    dataType: ZCLDataTypes.uint16,
    data: 1234,
}];
console.log(data);

let tmp = Buffer.alloc(250);
tmp = tmp.slice(0, AttributeDataRecordArray.toBuffer(tmp, data));

const test = new ZCLStandardHeader({
    cmdId: 123,
    data: tmp,
});

console.log(test, test.toBuffer());
console.log(tmp);
console.log(AttributeDataRecordArray.fromBuffer(tmp).result);