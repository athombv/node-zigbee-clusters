'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Reading Information Set (0x00 - 0x0F)
  currentSummationDelivered: { id: 0x0000, type: ZCLDataTypes.uint48 }, // Mandatory
  currentSummationReceived: { id: 0x0001, type: ZCLDataTypes.uint48 },
  currentMaxDemandDelivered: { id: 0x0002, type: ZCLDataTypes.uint48 },
  currentMaxDemandReceived: { id: 0x0003, type: ZCLDataTypes.uint48 },
  dftSummation: { id: 0x0004, type: ZCLDataTypes.uint48 },
  dailyFreezeTime: { id: 0x0005, type: ZCLDataTypes.uint16 },
  powerFactor: { id: 0x0006, type: ZCLDataTypes.int8 },
  readingSnapShotTime: { id: 0x0007, type: ZCLDataTypes.uint32 }, // UTC time
  currentMaxDemandDeliveredTime: { id: 0x0008, type: ZCLDataTypes.uint32 }, // UTC time
  currentMaxDemandReceivedTime: { id: 0x0009, type: ZCLDataTypes.uint32 }, // UTC time
  defaultUpdatePeriod: { id: 0x000A, type: ZCLDataTypes.uint8 },
  fastPollUpdatePeriod: { id: 0x000B, type: ZCLDataTypes.uint8 },
  currentBlockPeriodConsumptionDelivered: { id: 0x000C, type: ZCLDataTypes.uint48 },
  dailyConsumptionTarget: { id: 0x000D, type: ZCLDataTypes.uint24 },
  currentBlock: { id: 0x000E, type: ZCLDataTypes.enum8 },
  profileIntervalPeriod: { id: 0x000F, type: ZCLDataTypes.enum8 },

  // Summation TOU Information Set (0x0100 - 0x01FF)
  currentTier1SummationDelivered: { id: 0x0100, type: ZCLDataTypes.uint48 },
  currentTier1SummationReceived: { id: 0x0101, type: ZCLDataTypes.uint48 },
  currentTier2SummationDelivered: { id: 0x0102, type: ZCLDataTypes.uint48 },
  currentTier2SummationReceived: { id: 0x0103, type: ZCLDataTypes.uint48 },
  currentTier3SummationDelivered: { id: 0x0104, type: ZCLDataTypes.uint48 },
  currentTier3SummationReceived: { id: 0x0105, type: ZCLDataTypes.uint48 },
  currentTier4SummationDelivered: { id: 0x0106, type: ZCLDataTypes.uint48 },
  currentTier4SummationReceived: { id: 0x0107, type: ZCLDataTypes.uint48 },

  // Meter Status (0x0200 - 0x02FF)
  status: { id: 0x0200, type: ZCLDataTypes.map8 }, // MeterStatus bitmap
  remainingBatteryLife: { id: 0x0201, type: ZCLDataTypes.uint8 },
  hoursInOperation: { id: 0x0202, type: ZCLDataTypes.uint24 },
  hoursInFault: { id: 0x0203, type: ZCLDataTypes.uint24 },
  extendedStatus: { id: 0x0204, type: ZCLDataTypes.map64 },

  // Formatting Set (0x0300 - 0x03FF) - Critical for value interpretation
  unitOfMeasure: { id: 0x0300, type: ZCLDataTypes.enum8 }, // Mandatory: kWh, m³, etc.
  multiplier: { id: 0x0301, type: ZCLDataTypes.uint24 },
  divisor: { id: 0x0302, type: ZCLDataTypes.uint24 },
  summationFormatting: { id: 0x0303, type: ZCLDataTypes.map8 }, // Mandatory: decimal places
  demandFormatting: { id: 0x0304, type: ZCLDataTypes.map8 },
  historicalConsumptionFormatting: { id: 0x0305, type: ZCLDataTypes.map8 },
  meteringDeviceType: { id: 0x0306, type: ZCLDataTypes.map8 }, // Mandatory: Electric/Gas/Water
  siteId: { id: 0x0307, type: ZCLDataTypes.octstr },
  meterSerialNumber: { id: 0x0308, type: ZCLDataTypes.octstr },
  energyCarrierUnitOfMeasure: { id: 0x0309, type: ZCLDataTypes.enum8 },
  energyCarrierSummationFormatting: { id: 0x030A, type: ZCLDataTypes.map8 },
  energyCarrierDemandFormatting: { id: 0x030B, type: ZCLDataTypes.map8 },
  temperatureUnitOfMeasure: { id: 0x030C, type: ZCLDataTypes.enum8 },
  temperatureFormatting: { id: 0x030D, type: ZCLDataTypes.map8 },
  moduleSerialNumber: { id: 0x030E, type: ZCLDataTypes.octstr },
  operatingTariffLabelDelivered: { id: 0x030F, type: ZCLDataTypes.octstr },
  operatingTariffLabelReceived: { id: 0x0310, type: ZCLDataTypes.octstr },
  customerIdNumber: { id: 0x0311, type: ZCLDataTypes.octstr },
  alternativeUnitOfMeasure: { id: 0x0312, type: ZCLDataTypes.enum8 },
  alternativeDemandFormatting: { id: 0x0313, type: ZCLDataTypes.map8 },
  alternativeConsumptionFormatting: { id: 0x0314, type: ZCLDataTypes.map8 },

  // Historical Consumption (0x0400 - 0x04FF)
  instantaneousDemand: { id: 0x0400, type: ZCLDataTypes.int24 },
  currentDayConsumptionDelivered: { id: 0x0401, type: ZCLDataTypes.uint24 },
  currentDayConsumptionReceived: { id: 0x0402, type: ZCLDataTypes.uint24 },
  previousDayConsumptionDelivered: { id: 0x0403, type: ZCLDataTypes.uint24 },
  previousDayConsumptionReceived: { id: 0x0404, type: ZCLDataTypes.uint24 },
  currentPartialProfileIntervalStartTimeDelivered: { id: 0x0405, type: ZCLDataTypes.uint32 },
  currentPartialProfileIntervalStartTimeReceived: { id: 0x0406, type: ZCLDataTypes.uint32 },
  currentPartialProfileIntervalValueDelivered: { id: 0x0407, type: ZCLDataTypes.uint24 },
  currentPartialProfileIntervalValueReceived: { id: 0x0408, type: ZCLDataTypes.uint24 },
  currentDayMaxPressure: { id: 0x0409, type: ZCLDataTypes.uint48 },
  currentDayMinPressure: { id: 0x040A, type: ZCLDataTypes.uint48 },
  previousDayMaxPressure: { id: 0x040B, type: ZCLDataTypes.uint48 },
  previousDayMinPressure: { id: 0x040C, type: ZCLDataTypes.uint48 },
  currentDayMaxDemand: { id: 0x040D, type: ZCLDataTypes.int24 },
  previousDayMaxDemand: { id: 0x040E, type: ZCLDataTypes.int24 },
  currentMonthMaxDemand: { id: 0x040F, type: ZCLDataTypes.int24 },
  currentYearMaxDemand: { id: 0x0410, type: ZCLDataTypes.int24 },
  currentDayMaxEnergyCarrierDemand: { id: 0x0411, type: ZCLDataTypes.int24 },
  previousDayMaxEnergyCarrierDemand: { id: 0x0412, type: ZCLDataTypes.int24 },
  currentMonthMaxEnergyCarrierDemand: { id: 0x0413, type: ZCLDataTypes.int24 },
  currentMonthMinEnergyCarrierDemand: { id: 0x0414, type: ZCLDataTypes.int24 },
  currentYearMaxEnergyCarrierDemand: { id: 0x0415, type: ZCLDataTypes.int24 },
  currentYearMinEnergyCarrierDemand: { id: 0x0416, type: ZCLDataTypes.int24 },

  // Load Profile Configuration (0x0500 - 0x05FF)
  maxNumberOfPeriodsDelivered: { id: 0x0500, type: ZCLDataTypes.uint8 },

  // Supply Limit (0x0600 - 0x06FF)
  currentDemandDelivered: { id: 0x0600, type: ZCLDataTypes.uint24 },
  demandLimit: { id: 0x0601, type: ZCLDataTypes.uint24 },
  demandIntegrationPeriod: { id: 0x0602, type: ZCLDataTypes.uint8 },
  numberOfDemandSubintervals: { id: 0x0603, type: ZCLDataTypes.uint8 },
  demandLimitArmDuration: { id: 0x0604, type: ZCLDataTypes.uint16 },
};

const COMMANDS = {};

class MeteringCluster extends Cluster {

  static get ID() {
    return 1794; // 0x0702
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
