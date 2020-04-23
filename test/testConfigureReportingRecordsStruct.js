'use strict';

const assert = require('assert');

const {
  ZCLConfigureReportingRecords,
} = require('../lib/zclFrames');

const CONFIGURE_REPORTING_RECORDS_MOCK = [
  {
    direction: 'reported', // 1
    attributeId: 32, // 2
    attributeDataType: 33, // 1
    minInterval: 0, // 2
    maxInterval: 299, // 2
    minChange: 0xff, // var(2)  not configured default invalid value for this `attributeDataType`
  }, // total 10
  {
    direction: 'reported', // 1
    attributeId: 33, // 2
    attributeDataType: 32, // 1
    minInterval: 0, // 2
    maxInterval: 300, // 2
    minChange: 1, // var(1)
  }, // total 9
  {
    direction: 'reported', // 1
    attributeId: 12, // 2
    attributeDataType: 43, // 1
    minInterval: 3, // 2
    maxInterval: 2000, // 2
    minChange: 15, // var(4)
  }, // total 12
  {
    direction: 'reported', // 1
    attributeId: 99, // 2
    attributeDataType: 16, // 1
    minInterval: 10, // 2
    maxInterval: 400, // 2
  }, // total 8
  {
    direction: 'received', // 1
    attributeId: 99, // 2
    timeoutPeriod: 60, // 2
  }, // total 5

  // total 44
];
const CONFIGURE_REPORTING_RECORDS_BUFFER_MOCK = Buffer.from(
  '0020002100002b01ff000021002000002c0101000c002b0300d0070f000000006300100a0090010163003c00',
  'hex',
);
const CONFIGURE_REPORTING_RECORDS_WITH_STATUS_MOCK = [
  {
    status: 'SUCCESS',
    direction: 'reported', // 1
    attributeId: 32, // 2
    attributeDataType: 33, // 1
    minInterval: 0, // 2
    maxInterval: 299, // 2
    minChange: 0xff, // var(2)  not configured default invalid value for this `attributeDataType`
  },
  {
    status: 'UNREPORTABLE_ATTRIBUTE',
    direction: 'reported', // 1
    attributeId: 10, // 2
  },
  {
    status: 'SUCCESS',
    direction: 'reported', // 1
    attributeId: 32, // 2
    attributeDataType: 33, // 1
    minInterval: 0, // 2
    maxInterval: 299, // 2
    minChange: 0xff, // var(2)  not configured default invalid value for this `attributeDataType`
  },
];
const CONFIGURE_REPORTING_RECORDS_WITH_STATUS_BUFFER_MOCK = Buffer.from(
  '000020002100002b01ff008c000a00000020002100002b01ff00',
  'hex',
);

describe('command configure reporting', function() {
  it('should parse multiple records to buffer', function() {
    // Create type instance
    const ZCLConfigureReportingRecordsType = ZCLConfigureReportingRecords();

    // Allocate buffer to be filled with configure reporting records
    const buf = Buffer.alloc(44); // 39

    // Fill buffer
    ZCLConfigureReportingRecordsType.toBuffer(buf, CONFIGURE_REPORTING_RECORDS_MOCK, 0);

    // Assert buffer is as expected
    assert(buf.equals(CONFIGURE_REPORTING_RECORDS_BUFFER_MOCK));
  });

  it('should parse buffer to multiple records', function() {
    // Create type instance
    const ZCLConfigureReportingRecordsType = ZCLConfigureReportingRecords();

    // Allocate buffer to be filled with configure reporting records
    const parsedRecords = ZCLConfigureReportingRecordsType
      .fromBuffer(CONFIGURE_REPORTING_RECORDS_BUFFER_MOCK, 0);

    // Compare the parsed records against the initial records `configureReportingRecordsBuffer`
    for (let i = 0; i < CONFIGURE_REPORTING_RECORDS_MOCK.length; i++) {
      assert.deepEqual(CONFIGURE_REPORTING_RECORDS_MOCK[i], parsedRecords[i]);
    }
  });
});

describe('command read configure reporting', function() {
  it('should parse multiple records to buffer', function() {
    // Create type instance
    const ZCLConfigureReportingRecordsWithStatusType = ZCLConfigureReportingRecords({
      withStatus: true,
    });

    // Allocate buffer to be filled with configure reporting records
    const buf = Buffer.alloc(26);

    // Fill buffer
    ZCLConfigureReportingRecordsWithStatusType.toBuffer(
      buf,
      CONFIGURE_REPORTING_RECORDS_WITH_STATUS_MOCK,
      0,
    );
    assert(buf.equals(CONFIGURE_REPORTING_RECORDS_WITH_STATUS_BUFFER_MOCK));
  });

  it('should parse buffer to multiple records', function() {
    // Create type instance
    const ZCLConfigureReportingRecordsWithStatusType = ZCLConfigureReportingRecords({
      withStatus: true,
    });

    // Allocate buffer to be filled with configure reporting records
    const parsedRecords = ZCLConfigureReportingRecordsWithStatusType
      .fromBuffer(CONFIGURE_REPORTING_RECORDS_WITH_STATUS_BUFFER_MOCK, 0);

    // Compare the parsed records against the initial records `configureReportingRecordsBuffer`
    for (let i = 0; i < CONFIGURE_REPORTING_RECORDS_WITH_STATUS_MOCK.length; i++) {
      assert.deepEqual(CONFIGURE_REPORTING_RECORDS_WITH_STATUS_MOCK[i], parsedRecords[i]);
    }
  });
});
