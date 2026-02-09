'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Reading Information Set (0x0000 - 0x000F)
  currentSummationDelivered: { id: 0x0000, type: ZCLDataTypes.uint48 }, // Mandatory
  currentSummationReceived: { id: 0x0001, type: ZCLDataTypes.uint48 }, // Optional
  currentMaxDemandDelivered: { id: 0x0002, type: ZCLDataTypes.uint48 }, // Optional
  currentMaxDemandReceived: { id: 0x0003, type: ZCLDataTypes.uint48 }, // Optional
  dftSummation: { id: 0x0004, type: ZCLDataTypes.uint48 }, // Optional
  dailyFreezeTime: { id: 0x0005, type: ZCLDataTypes.uint16 }, // Optional
  powerFactor: { id: 0x0006, type: ZCLDataTypes.int8 }, // Optional
  readingSnapShotTime: { id: 0x0007, type: ZCLDataTypes.uint32 }, // Optional
  currentMaxDemandDeliveredTime: { id: 0x0008, type: ZCLDataTypes.uint32 }, // Optional
  currentMaxDemandReceivedTime: { id: 0x0009, type: ZCLDataTypes.uint32 }, // Optional
  defaultUpdatePeriod: { id: 0x000A, type: ZCLDataTypes.uint8 }, // 10, Optional
  fastPollUpdatePeriod: { id: 0x000B, type: ZCLDataTypes.uint8 }, // 11, Optional
  currentBlockPeriodConsumptionDelivered: { id: 0x000C, type: ZCLDataTypes.uint48 }, // 12, Optional
  dailyConsumptionTarget: { id: 0x000D, type: ZCLDataTypes.uint24 }, // 13, Optional
  currentBlock: { id: 0x000E, type: ZCLDataTypes.enum8 }, // 14, Optional
  profileIntervalPeriod: { id: 0x000F, type: ZCLDataTypes.enum8 }, // 15, Optional

  // Summation TOU Information Set (0x0100 - 0x01FF)
  currentTier1SummationDelivered: { id: 0x0100, type: ZCLDataTypes.uint48 }, // 256, Optional
  currentTier1SummationReceived: { id: 0x0101, type: ZCLDataTypes.uint48 }, // 257, Optional
  currentTier2SummationDelivered: { id: 0x0102, type: ZCLDataTypes.uint48 }, // 258, Optional
  currentTier2SummationReceived: { id: 0x0103, type: ZCLDataTypes.uint48 }, // 259, Optional
  currentTier3SummationDelivered: { id: 0x0104, type: ZCLDataTypes.uint48 }, // 260, Optional
  currentTier3SummationReceived: { id: 0x0105, type: ZCLDataTypes.uint48 }, // 261, Optional
  currentTier4SummationDelivered: { id: 0x0106, type: ZCLDataTypes.uint48 }, // 262, Optional
  currentTier4SummationReceived: { id: 0x0107, type: ZCLDataTypes.uint48 }, // 263, Optional

  // Meter Status (0x0200 - 0x02FF)
  status: { id: 0x0200, type: ZCLDataTypes.map8 }, // 512, Optional
  remainingBatteryLife: { id: 0x0201, type: ZCLDataTypes.uint8 }, // 513, Optional
  hoursInOperation: { id: 0x0202, type: ZCLDataTypes.uint24 }, // 514, Optional
  hoursInFault: { id: 0x0203, type: ZCLDataTypes.uint24 }, // 515, Optional
  extendedStatus: { id: 0x0204, type: ZCLDataTypes.map64 }, // 516, Optional

  // Formatting Set (0x0300 - 0x03FF)
  unitOfMeasure: { id: 0x0300, type: ZCLDataTypes.enum8 }, // 768, Mandatory
  multiplier: { id: 0x0301, type: ZCLDataTypes.uint24 }, // 769, Optional
  divisor: { id: 0x0302, type: ZCLDataTypes.uint24 }, // 770, Optional
  summationFormatting: { id: 0x0303, type: ZCLDataTypes.map8 }, // 771, Mandatory
  demandFormatting: { id: 0x0304, type: ZCLDataTypes.map8 }, // 772, Optional
  historicalConsumptionFormatting: { id: 0x0305, type: ZCLDataTypes.map8 }, // 773, Optional
  meteringDeviceType: { id: 0x0306, type: ZCLDataTypes.map8 }, // 774, Mandatory
  siteId: { id: 0x0307, type: ZCLDataTypes.octstr }, // 775, Optional
  meterSerialNumber: { id: 0x0308, type: ZCLDataTypes.octstr }, // 776, Optional
  energyCarrierUnitOfMeasure: { id: 0x0309, type: ZCLDataTypes.enum8 }, // 777, Optional
  energyCarrierSummationFormatting: { id: 0x030A, type: ZCLDataTypes.map8 }, // 778, Optional
  energyCarrierDemandFormatting: { id: 0x030B, type: ZCLDataTypes.map8 }, // 779, Optional
  temperatureUnitOfMeasure: { id: 0x030C, type: ZCLDataTypes.enum8 }, // 780, Optional
  temperatureFormatting: { id: 0x030D, type: ZCLDataTypes.map8 }, // 781, Optional
  moduleSerialNumber: { id: 0x030E, type: ZCLDataTypes.octstr }, // 782, Optional
  operatingTariffLabelDelivered: { id: 0x030F, type: ZCLDataTypes.octstr }, // 783, Optional
  operatingTariffLabelReceived: { id: 0x0310, type: ZCLDataTypes.octstr }, // 784, Optional
  customerIdNumber: { id: 0x0311, type: ZCLDataTypes.octstr }, // 785, Optional
  alternativeUnitOfMeasure: { id: 0x0312, type: ZCLDataTypes.enum8 }, // 786, Optional
  alternativeDemandFormatting: { id: 0x0313, type: ZCLDataTypes.map8 }, // 787, Optional
  alternativeConsumptionFormatting: { id: 0x0314, type: ZCLDataTypes.map8 }, // 788, Optional

  // Historical Consumption (0x0400 - 0x04FF)
  instantaneousDemand: { id: 0x0400, type: ZCLDataTypes.int24 }, // 1024, Optional
  currentDayConsumptionDelivered: { id: 0x0401, type: ZCLDataTypes.uint24 }, // 1025, Optional
  currentDayConsumptionReceived: { id: 0x0402, type: ZCLDataTypes.uint24 }, // 1026, Optional
  previousDayConsumptionDelivered: { id: 0x0403, type: ZCLDataTypes.uint24 }, // 1027, Optional
  previousDayConsumptionReceived: { id: 0x0404, type: ZCLDataTypes.uint24 }, // 1028, Optional
  currentPartialProfileIntervalStartTimeDelivered: { // Optional
    id: 0x0405, // 1029
    type: ZCLDataTypes.uint32,
  },
  currentPartialProfileIntervalStartTimeReceived: { // Optional
    id: 0x0406, // 1030
    type: ZCLDataTypes.uint32,
  },
  currentPartialProfileIntervalValueDelivered: { // Optional
    id: 0x0407, // 1031
    type: ZCLDataTypes.uint24,
  },
  currentPartialProfileIntervalValueReceived: { // Optional
    id: 0x0408, // 1032
    type: ZCLDataTypes.uint24,
  },
  currentDayMaxPressure: { id: 0x0409, type: ZCLDataTypes.uint48 }, // 1033, Optional
  currentDayMinPressure: { id: 0x040A, type: ZCLDataTypes.uint48 }, // 1034, Optional
  previousDayMaxPressure: { id: 0x040B, type: ZCLDataTypes.uint48 }, // 1035, Optional
  previousDayMinPressure: { id: 0x040C, type: ZCLDataTypes.uint48 }, // 1036, Optional
  currentDayMaxDemand: { id: 0x040D, type: ZCLDataTypes.int24 }, // 1037, Optional
  previousDayMaxDemand: { id: 0x040E, type: ZCLDataTypes.int24 }, // 1038, Optional
  currentMonthMaxDemand: { id: 0x040F, type: ZCLDataTypes.int24 }, // 1039, Optional
  currentYearMaxDemand: { id: 0x0410, type: ZCLDataTypes.int24 }, // 1040, Optional
  currentDayMaxEnergyCarrierDemand: { id: 0x0411, type: ZCLDataTypes.int24 }, // 1041, Optional
  previousDayMaxEnergyCarrierDemand: { id: 0x0412, type: ZCLDataTypes.int24 }, // 1042, Optional
  currentMonthMaxEnergyCarrierDemand: { id: 0x0413, type: ZCLDataTypes.int24 }, // 1043, Optional
  currentMonthMinEnergyCarrierDemand: { id: 0x0414, type: ZCLDataTypes.int24 }, // 1044, Optional
  currentYearMaxEnergyCarrierDemand: { id: 0x0415, type: ZCLDataTypes.int24 }, // 1045, Optional
  currentYearMinEnergyCarrierDemand: { id: 0x0416, type: ZCLDataTypes.int24 }, // 1046, Optional

  // Load Profile Configuration (0x0500 - 0x05FF)
  maxNumberOfPeriodsDelivered: { id: 0x0500, type: ZCLDataTypes.uint8 }, // 1280, Optional

  // Supply Limit (0x0600 - 0x06FF)
  currentDemandDelivered: { id: 0x0600, type: ZCLDataTypes.uint24 }, // 1536, Optional
  demandLimit: { id: 0x0601, type: ZCLDataTypes.uint24 }, // 1537, Optional
  demandIntegrationPeriod: { id: 0x0602, type: ZCLDataTypes.uint8 }, // 1538, Optional
  numberOfDemandSubintervals: { id: 0x0603, type: ZCLDataTypes.uint8 }, // 1539, Optional
  demandLimitArmDuration: { id: 0x0604, type: ZCLDataTypes.uint16 }, // 1540, Optional
};

const COMMANDS = {};

class MeteringCluster extends Cluster {

  static get ID() {
    return 0x0702; // 1794
  }

  static get NAME() {
    return 'metering';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(MeteringCluster);

module.exports = MeteringCluster;
