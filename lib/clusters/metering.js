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

  // Block Information Delivered (0x0700 - 0x07FF)
  // All attributes in this section are Optional
  currentNoTierBlock1SummationDelivered: { id: 0x0700, type: ZCLDataTypes.uint48 },
  currentNoTierBlock2SummationDelivered: { id: 0x0701, type: ZCLDataTypes.uint48 },
  currentNoTierBlock3SummationDelivered: { id: 0x0702, type: ZCLDataTypes.uint48 },
  currentNoTierBlock4SummationDelivered: { id: 0x0703, type: ZCLDataTypes.uint48 },
  currentNoTierBlock5SummationDelivered: { id: 0x0704, type: ZCLDataTypes.uint48 },
  currentNoTierBlock6SummationDelivered: { id: 0x0705, type: ZCLDataTypes.uint48 },
  currentNoTierBlock7SummationDelivered: { id: 0x0706, type: ZCLDataTypes.uint48 },
  currentNoTierBlock8SummationDelivered: { id: 0x0707, type: ZCLDataTypes.uint48 },
  currentNoTierBlock9SummationDelivered: { id: 0x0708, type: ZCLDataTypes.uint48 },
  currentNoTierBlock10SummationDelivered: { id: 0x0709, type: ZCLDataTypes.uint48 },
  currentNoTierBlock11SummationDelivered: { id: 0x070A, type: ZCLDataTypes.uint48 },
  currentNoTierBlock12SummationDelivered: { id: 0x070B, type: ZCLDataTypes.uint48 },
  currentNoTierBlock13SummationDelivered: { id: 0x070C, type: ZCLDataTypes.uint48 },
  currentNoTierBlock14SummationDelivered: { id: 0x070D, type: ZCLDataTypes.uint48 },
  currentNoTierBlock15SummationDelivered: { id: 0x070E, type: ZCLDataTypes.uint48 },
  currentNoTierBlock16SummationDelivered: { id: 0x070F, type: ZCLDataTypes.uint48 },
  currentTier1Block1SummationDelivered: { id: 0x0710, type: ZCLDataTypes.uint48 },
  currentTier1Block2SummationDelivered: { id: 0x0711, type: ZCLDataTypes.uint48 },
  currentTier1Block3SummationDelivered: { id: 0x0712, type: ZCLDataTypes.uint48 },
  currentTier1Block4SummationDelivered: { id: 0x0713, type: ZCLDataTypes.uint48 },
  currentTier1Block5SummationDelivered: { id: 0x0714, type: ZCLDataTypes.uint48 },
  currentTier1Block6SummationDelivered: { id: 0x0715, type: ZCLDataTypes.uint48 },
  currentTier1Block7SummationDelivered: { id: 0x0716, type: ZCLDataTypes.uint48 },
  currentTier1Block8SummationDelivered: { id: 0x0717, type: ZCLDataTypes.uint48 },
  currentTier1Block9SummationDelivered: { id: 0x0718, type: ZCLDataTypes.uint48 },
  currentTier1Block10SummationDelivered: { id: 0x0719, type: ZCLDataTypes.uint48 },
  currentTier1Block11SummationDelivered: { id: 0x071A, type: ZCLDataTypes.uint48 },
  currentTier1Block12SummationDelivered: { id: 0x071B, type: ZCLDataTypes.uint48 },
  currentTier1Block13SummationDelivered: { id: 0x071C, type: ZCLDataTypes.uint48 },
  currentTier1Block14SummationDelivered: { id: 0x071D, type: ZCLDataTypes.uint48 },
  currentTier1Block15SummationDelivered: { id: 0x071E, type: ZCLDataTypes.uint48 },
  currentTier1Block16SummationDelivered: { id: 0x071F, type: ZCLDataTypes.uint48 },
  currentTier2Block1SummationDelivered: { id: 0x0720, type: ZCLDataTypes.uint48 },
  currentTier2Block2SummationDelivered: { id: 0x0721, type: ZCLDataTypes.uint48 },
  currentTier2Block3SummationDelivered: { id: 0x0722, type: ZCLDataTypes.uint48 },
  currentTier2Block4SummationDelivered: { id: 0x0723, type: ZCLDataTypes.uint48 },
  currentTier2Block5SummationDelivered: { id: 0x0724, type: ZCLDataTypes.uint48 },
  currentTier2Block6SummationDelivered: { id: 0x0725, type: ZCLDataTypes.uint48 },
  currentTier2Block7SummationDelivered: { id: 0x0726, type: ZCLDataTypes.uint48 },
  currentTier2Block8SummationDelivered: { id: 0x0727, type: ZCLDataTypes.uint48 },
  currentTier2Block9SummationDelivered: { id: 0x0728, type: ZCLDataTypes.uint48 },
  currentTier2Block10SummationDelivered: { id: 0x0729, type: ZCLDataTypes.uint48 },
  currentTier2Block11SummationDelivered: { id: 0x072A, type: ZCLDataTypes.uint48 },
  currentTier2Block12SummationDelivered: { id: 0x072B, type: ZCLDataTypes.uint48 },
  currentTier2Block13SummationDelivered: { id: 0x072C, type: ZCLDataTypes.uint48 },
  currentTier2Block14SummationDelivered: { id: 0x072D, type: ZCLDataTypes.uint48 },
  currentTier2Block15SummationDelivered: { id: 0x072E, type: ZCLDataTypes.uint48 },
  currentTier2Block16SummationDelivered: { id: 0x072F, type: ZCLDataTypes.uint48 },
  currentTier3Block1SummationDelivered: { id: 0x0730, type: ZCLDataTypes.uint48 },
  currentTier3Block2SummationDelivered: { id: 0x0731, type: ZCLDataTypes.uint48 },
  currentTier3Block3SummationDelivered: { id: 0x0732, type: ZCLDataTypes.uint48 },
  currentTier3Block4SummationDelivered: { id: 0x0733, type: ZCLDataTypes.uint48 },
  currentTier3Block5SummationDelivered: { id: 0x0734, type: ZCLDataTypes.uint48 },
  currentTier3Block6SummationDelivered: { id: 0x0735, type: ZCLDataTypes.uint48 },
  currentTier3Block7SummationDelivered: { id: 0x0736, type: ZCLDataTypes.uint48 },
  currentTier3Block8SummationDelivered: { id: 0x0737, type: ZCLDataTypes.uint48 },
  currentTier3Block9SummationDelivered: { id: 0x0738, type: ZCLDataTypes.uint48 },
  currentTier3Block10SummationDelivered: { id: 0x0739, type: ZCLDataTypes.uint48 },
  currentTier3Block11SummationDelivered: { id: 0x073A, type: ZCLDataTypes.uint48 },
  currentTier3Block12SummationDelivered: { id: 0x073B, type: ZCLDataTypes.uint48 },
  currentTier3Block13SummationDelivered: { id: 0x073C, type: ZCLDataTypes.uint48 },
  currentTier3Block14SummationDelivered: { id: 0x073D, type: ZCLDataTypes.uint48 },
  currentTier3Block15SummationDelivered: { id: 0x073E, type: ZCLDataTypes.uint48 },
  currentTier3Block16SummationDelivered: { id: 0x073F, type: ZCLDataTypes.uint48 },
  currentTier4Block1SummationDelivered: { id: 0x0740, type: ZCLDataTypes.uint48 },
  currentTier4Block2SummationDelivered: { id: 0x0741, type: ZCLDataTypes.uint48 },
  currentTier4Block3SummationDelivered: { id: 0x0742, type: ZCLDataTypes.uint48 },
  currentTier4Block4SummationDelivered: { id: 0x0743, type: ZCLDataTypes.uint48 },
  currentTier4Block5SummationDelivered: { id: 0x0744, type: ZCLDataTypes.uint48 },
  currentTier4Block6SummationDelivered: { id: 0x0745, type: ZCLDataTypes.uint48 },
  currentTier4Block7SummationDelivered: { id: 0x0746, type: ZCLDataTypes.uint48 },
  currentTier4Block8SummationDelivered: { id: 0x0747, type: ZCLDataTypes.uint48 },
  currentTier4Block9SummationDelivered: { id: 0x0748, type: ZCLDataTypes.uint48 },
  currentTier4Block10SummationDelivered: { id: 0x0749, type: ZCLDataTypes.uint48 },
  currentTier4Block11SummationDelivered: { id: 0x074A, type: ZCLDataTypes.uint48 },
  currentTier4Block12SummationDelivered: { id: 0x074B, type: ZCLDataTypes.uint48 },
  currentTier4Block13SummationDelivered: { id: 0x074C, type: ZCLDataTypes.uint48 },
  currentTier4Block14SummationDelivered: { id: 0x074D, type: ZCLDataTypes.uint48 },
  currentTier4Block15SummationDelivered: { id: 0x074E, type: ZCLDataTypes.uint48 },
  currentTier4Block16SummationDelivered: { id: 0x074F, type: ZCLDataTypes.uint48 },

  // Alarms (0x0800 - 0x08FF)
  genericAlarmMask: { id: 0x0800, type: ZCLDataTypes.map16 }, // 2048, Optional
  electricityAlarmMask: { id: 0x0801, type: ZCLDataTypes.map32 }, // 2049, Optional
  genericFlowPressureAlarmMask: { id: 0x0802, type: ZCLDataTypes.map16 }, // 2050, Optional
  waterSpecificAlarmMask: { id: 0x0803, type: ZCLDataTypes.map16 }, // 2051, Optional
  heatAndCoolingSpecificAlarmMask: { id: 0x0804, type: ZCLDataTypes.map16 }, // 2052, Optional
  gasSpecificAlarmMask: { id: 0x0805, type: ZCLDataTypes.map16 }, // 2053, Optional
  extendedGenericAlarmMask: { id: 0x0806, type: ZCLDataTypes.map48 }, // 2054, Optional
  manufacturerAlarmMask: { id: 0x0807, type: ZCLDataTypes.map16 }, // 2055, Optional

  // Block Information Received (0x0900 - 0x09FF)
  // All attributes in this section are Optional
  currentNoTierBlock1SummationReceived: { id: 0x0900, type: ZCLDataTypes.uint48 },
  currentNoTierBlock2SummationReceived: { id: 0x0901, type: ZCLDataTypes.uint48 },
  currentNoTierBlock3SummationReceived: { id: 0x0902, type: ZCLDataTypes.uint48 },
  currentNoTierBlock4SummationReceived: { id: 0x0903, type: ZCLDataTypes.uint48 },
  currentNoTierBlock5SummationReceived: { id: 0x0904, type: ZCLDataTypes.uint48 },
  currentNoTierBlock6SummationReceived: { id: 0x0905, type: ZCLDataTypes.uint48 },
  currentNoTierBlock7SummationReceived: { id: 0x0906, type: ZCLDataTypes.uint48 },
  currentNoTierBlock8SummationReceived: { id: 0x0907, type: ZCLDataTypes.uint48 },
  currentNoTierBlock9SummationReceived: { id: 0x0908, type: ZCLDataTypes.uint48 },
  currentNoTierBlock10SummationReceived: { id: 0x0909, type: ZCLDataTypes.uint48 },
  currentNoTierBlock11SummationReceived: { id: 0x090A, type: ZCLDataTypes.uint48 },
  currentNoTierBlock12SummationReceived: { id: 0x090B, type: ZCLDataTypes.uint48 },
  currentNoTierBlock13SummationReceived: { id: 0x090C, type: ZCLDataTypes.uint48 },
  currentNoTierBlock14SummationReceived: { id: 0x090D, type: ZCLDataTypes.uint48 },
  currentNoTierBlock15SummationReceived: { id: 0x090E, type: ZCLDataTypes.uint48 },
  currentNoTierBlock16SummationReceived: { id: 0x090F, type: ZCLDataTypes.uint48 },

  // Meter Billing (0x0A00 - 0x0AFF)
  billToDateDelivered: { id: 0x0A00, type: ZCLDataTypes.uint32 }, // 2560, Optional
  billToDateTimeStampDelivered: { id: 0x0A01, type: ZCLDataTypes.uint32 }, // 2561, Optional
  projectedBillDelivered: { id: 0x0A02, type: ZCLDataTypes.uint32 }, // 2562, Optional
  projectedBillTimeStampDelivered: { id: 0x0A03, type: ZCLDataTypes.uint32 }, // 2563, Optional
  billDeliveredTrailingDigit: { id: 0x0A04, type: ZCLDataTypes.map8 }, // 2564, Optional
  billToDateReceived: { id: 0x0A10, type: ZCLDataTypes.uint32 }, // 2576, Optional
  billToDateTimeStampReceived: { id: 0x0A11, type: ZCLDataTypes.uint32 }, // 2577, Optional
  projectedBillReceived: { id: 0x0A12, type: ZCLDataTypes.uint32 }, // 2578, Optional
  projectedBillTimeStampReceived: { id: 0x0A13, type: ZCLDataTypes.uint32 }, // 2579, Optional
  billReceivedTrailingDigit: { id: 0x0A14, type: ZCLDataTypes.map8 }, // 2580, Optional

  // Supply Control (0x0B00 - 0x0BFF)
  proposedChangeSupplyImplementationTime: { // Optional
    id: 0x0B00, // 2816
    type: ZCLDataTypes.uint32,
  },
  proposedChangeSupplyStatus: { id: 0x0B01, type: ZCLDataTypes.enum8 }, // 2817, Optional
  uncontrolledFlowThreshold: { id: 0x0B10, type: ZCLDataTypes.uint16 }, // 2832, Optional
  uncontrolledFlowThresholdUnitOfMeasure: { // Optional
    id: 0x0B11, // 2833
    type: ZCLDataTypes.enum8,
  },
  uncontrolledFlowMultiplier: { id: 0x0B12, type: ZCLDataTypes.uint16 }, // 2834, Optional
  uncontrolledFlowDivisor: { id: 0x0B13, type: ZCLDataTypes.uint16 }, // 2835, Optional
  flowStabilisationPeriod: { id: 0x0B14, type: ZCLDataTypes.uint8 }, // 2836, Optional
  flowMeasurementPeriod: { id: 0x0B15, type: ZCLDataTypes.uint16 }, // 2837, Optional
};

const COMMANDS = {
  // --- Server to Client Commands ---

  getProfileResponse: { // Optional
    id: 0x0000,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      endTime: ZCLDataTypes.uint32,
      status: ZCLDataTypes.enum8,
      profileIntervalPeriod: ZCLDataTypes.enum8,
      numberOfPeriodsDelivered: ZCLDataTypes.uint8,
      intervals: ZCLDataTypes.buffer,
    },
  },
  requestMirror: { // Optional
    id: 0x0001,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
  },
  removeMirror: { // Optional
    id: 0x0002,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
  },
  requestFastPollModeResponse: { // Optional
    id: 0x0003,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      appliedUpdatePeriod: ZCLDataTypes.uint8,
      fastPollModeEndTime: ZCLDataTypes.uint32,
    },
  },
  scheduleSnapshotResponse: { // Optional
    id: 0x0004,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      snapshotResponsePayload: ZCLDataTypes.buffer,
    },
  },
  takeSnapshotResponse: { // Optional
    id: 0x0005,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      snapshotId: ZCLDataTypes.uint32,
      snapshotConfirmation: ZCLDataTypes.enum8,
    },
  },
  publishSnapshot: { // Optional
    id: 0x0006,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      snapshotId: ZCLDataTypes.uint32,
      snapshotTime: ZCLDataTypes.uint32,
      totalSnapshotsFound: ZCLDataTypes.uint8,
      commandIndex: ZCLDataTypes.uint8,
      totalCommands: ZCLDataTypes.uint8,
      snapshotCause: ZCLDataTypes.map32,
      snapshotPayloadType: ZCLDataTypes.enum8,
      snapshotPayload: ZCLDataTypes.buffer,
    },
  },
  getSampledDataResponse: { // Optional
    id: 0x0007,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      sampleId: ZCLDataTypes.uint16,
      sampleStartTime: ZCLDataTypes.uint32,
      sampleType: ZCLDataTypes.enum8,
      sampleRequestInterval: ZCLDataTypes.uint16,
      numberOfSamples: ZCLDataTypes.uint16,
      samples: ZCLDataTypes.buffer,
    },
  },
  configureMirror: { // Optional
    id: 0x0008,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      reportingInterval: ZCLDataTypes.uint24,
      mirrorNotificationReporting: ZCLDataTypes.bool,
      notificationScheme: ZCLDataTypes.uint8,
    },
  },
  configureNotificationScheme: { // Optional
    id: 0x0009,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      notificationScheme: ZCLDataTypes.uint8,
      notificationFlagOrder: ZCLDataTypes.map32,
    },
  },
  configureNotificationFlags: { // Optional
    id: 0x000A, // 10
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      notificationScheme: ZCLDataTypes.uint8,
      notificationFlagAttributeId: ZCLDataTypes.uint16,
      clusterId: ZCLDataTypes.uint16,
      manufacturerCode: ZCLDataTypes.uint16,
      numberOfCommands: ZCLDataTypes.uint8,
      commandIds: ZCLDataTypes.buffer,
    },
  },
  getNotifiedMessage: { // Optional
    id: 0x000B, // 11
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      notificationScheme: ZCLDataTypes.uint8,
      notificationFlagAttributeId: ZCLDataTypes.uint16,
      notificationFlagsN: ZCLDataTypes.map32,
    },
  },
  supplyStatusResponse: { // Optional
    id: 0x000C, // 12
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      providerId: ZCLDataTypes.uint32,
      issuerEventId: ZCLDataTypes.uint32,
      implementationDateTime: ZCLDataTypes.uint32,
      supplyStatus: ZCLDataTypes.enum8,
    },
  },
  startSamplingResponse: { // Optional
    id: 0x000D, // 13
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      sampleId: ZCLDataTypes.uint16,
    },
  },

  // --- Client to Server Commands ---

  getProfile: { // Optional
    id: 0x0000,
    args: {
      intervalChannel: ZCLDataTypes.enum8,
      endTime: ZCLDataTypes.uint32,
      numberOfPeriods: ZCLDataTypes.uint8,
    },
  },
  requestMirrorResponse: { // Optional
    id: 0x0001,
    args: {
      endpointId: ZCLDataTypes.uint16,
    },
  },
  mirrorRemoved: { // Optional
    id: 0x0002,
    args: {
      endpointId: ZCLDataTypes.uint16,
    },
  },
  requestFastPollMode: { // Optional
    id: 0x0003,
    args: {
      fastPollUpdatePeriod: ZCLDataTypes.uint8,
      duration: ZCLDataTypes.uint8,
    },
  },
  scheduleSnapshot: { // Optional
    id: 0x0004,
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      commandIndex: ZCLDataTypes.uint8,
      commandCount: ZCLDataTypes.uint8,
      snapshotSchedulePayload: ZCLDataTypes.buffer,
    },
  },
  takeSnapshot: { // Optional
    id: 0x0005,
    args: {
      snapshotCause: ZCLDataTypes.map32,
    },
  },
  getSnapshot: { // Optional
    id: 0x0006,
    args: {
      earliestStartTime: ZCLDataTypes.uint32,
      latestEndTime: ZCLDataTypes.uint32,
      snapshotOffset: ZCLDataTypes.uint8,
      snapshotCause: ZCLDataTypes.map32,
    },
  },
  startSampling: { // Optional
    id: 0x0007,
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      startSamplingTime: ZCLDataTypes.uint32,
      sampleType: ZCLDataTypes.enum8,
      sampleRequestInterval: ZCLDataTypes.uint16,
      maxNumberOfSamples: ZCLDataTypes.uint16,
    },
  },
  getSampledData: { // Optional
    id: 0x0008,
    args: {
      sampleId: ZCLDataTypes.uint16,
      earliestSampleTime: ZCLDataTypes.uint32,
      sampleType: ZCLDataTypes.enum8,
      numberOfSamples: ZCLDataTypes.uint16,
    },
  },
  mirrorReportAttributeResponse: { // Optional
    id: 0x0009,
    args: {
      notificationScheme: ZCLDataTypes.uint8,
      notificationFlags: ZCLDataTypes.buffer,
    },
  },
  resetLoadLimitCounter: { // Optional
    id: 0x000A, // 10
    args: {
      providerId: ZCLDataTypes.uint32,
      issuerEventId: ZCLDataTypes.uint32,
    },
  },
  changeSupply: { // Optional
    id: 0x000B, // 11
    args: {
      providerId: ZCLDataTypes.uint32,
      issuerEventId: ZCLDataTypes.uint32,
      requestDateTime: ZCLDataTypes.uint32,
      implementationDateTime: ZCLDataTypes.uint32,
      proposedSupplyStatus: ZCLDataTypes.enum8,
      supplyControlBits: ZCLDataTypes.map8,
    },
  },
  localChangeSupply: { // Optional
    id: 0x000C, // 12
    args: {
      proposedSupplyStatus: ZCLDataTypes.enum8,
    },
  },
  setSupplyStatus: { // Optional
    id: 0x000D, // 13
    args: {
      issuerEventId: ZCLDataTypes.uint32,
      supplyTamperState: ZCLDataTypes.enum8,
      supplyDepletionState: ZCLDataTypes.enum8,
      supplyUncontrolledFlowState: ZCLDataTypes.enum8,
      loadLimitSupplyState: ZCLDataTypes.enum8,
    },
  },
  setUncontrolledFlowThreshold: { // Optional
    id: 0x000E, // 14
    args: {
      providerId: ZCLDataTypes.uint32,
      issuerEventId: ZCLDataTypes.uint32,
      uncontrolledFlowThreshold: ZCLDataTypes.uint16,
      unitOfMeasure: ZCLDataTypes.enum8,
      multiplier: ZCLDataTypes.uint16,
      divisor: ZCLDataTypes.uint16,
      stabilisationPeriod: ZCLDataTypes.uint8,
      measurementPeriod: ZCLDataTypes.uint16,
    },
  },
};

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
