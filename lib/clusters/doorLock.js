'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Lock Information (0x0000 - 0x000F)
  lockState: { // Mandatory
    id: 0x0000,
    type: ZCLDataTypes.enum8({
      notFullyLocked: 0,
      locked: 1,
      unlocked: 2,
      undefined: 255,
    }),
  },
  lockType: { // Mandatory
    id: 0x0001,
    type: ZCLDataTypes.enum8({
      deadBolt: 0,
      magnetic: 1,
      other: 2,
      mortise: 3,
      rim: 4,
      latchBolt: 5,
      cylindricalLock: 6,
      tubularLock: 7,
      interconnectedLock: 8,
      deadLatch: 9,
      doorFurniture: 10,
    }),
  },
  actuatorEnabled: { id: 0x0002, type: ZCLDataTypes.bool }, // Mandatory
  doorState: { // Optional
    id: 0x0003,
    type: ZCLDataTypes.enum8({
      open: 0,
      closed: 1,
      errorJammed: 2,
      errorForcedOpen: 3,
      errorUnspecified: 4,
      undefined: 255,
    }),
  },
  doorOpenEvents: { id: 0x0004, type: ZCLDataTypes.uint32 }, // Optional
  doorClosedEvents: { id: 0x0005, type: ZCLDataTypes.uint32 }, // Optional
  openPeriod: { id: 0x0006, type: ZCLDataTypes.uint16 }, // Optional

  // User/PIN/RFID Configuration (0x0010 - 0x001F)
  numberOfLogRecordsSupported: { id: 0x0010, type: ZCLDataTypes.uint16 }, // 16, Optional
  numberOfTotalUsersSupported: { id: 0x0011, type: ZCLDataTypes.uint16 }, // 17, Optional
  numberOfPINUsersSupported: { id: 0x0012, type: ZCLDataTypes.uint16 }, // 18, Optional
  numberOfRFIDUsersSupported: { id: 0x0013, type: ZCLDataTypes.uint16 }, // 19, Optional
  numberOfWeekDaySchedulesSupportedPerUser: { // Optional
    id: 0x0014, // 20
    type: ZCLDataTypes.uint8,
  },
  numberOfYearDaySchedulesSupportedPerUser: { // Optional
    id: 0x0015, // 21
    type: ZCLDataTypes.uint8,
  },
  numberOfHolidaySchedulesSupported: { id: 0x0016, type: ZCLDataTypes.uint8 }, // 22, Optional
  maxPINCodeLength: { id: 0x0017, type: ZCLDataTypes.uint8 }, // 23, Optional
  minPINCodeLength: { id: 0x0018, type: ZCLDataTypes.uint8 }, // 24, Optional
  maxRFIDCodeLength: { id: 0x0019, type: ZCLDataTypes.uint8 }, // 25, Optional
  minRFIDCodeLength: { id: 0x001A, type: ZCLDataTypes.uint8 }, // 26, Optional

  // Operational Settings (0x0020 - 0x002F)
  enableLogging: { id: 0x0020, type: ZCLDataTypes.bool }, // 32, Optional
  language: { id: 0x0021, type: ZCLDataTypes.string }, // 33, Optional
  ledSettings: { id: 0x0022, type: ZCLDataTypes.uint8 }, // 34, Optional
  autoRelockTime: { id: 0x0023, type: ZCLDataTypes.uint32 }, // 35, Optional
  soundVolume: { id: 0x0024, type: ZCLDataTypes.uint8 }, // 36, Optional
  operatingMode: { // Optional
    id: 0x0025, // 37
    type: ZCLDataTypes.enum8({
      normal: 0,
      vacation: 1,
      privacy: 2,
      noRFLockOrUnlock: 3,
      passage: 4,
    }),
  },
  supportedOperatingModes: { // Mandatory
    id: 0x0026, // 38
    type: ZCLDataTypes.map16(
      'normal',
      'vacation',
      'privacy',
      'noRFLockOrUnlock',
      'passage',
    ),
  },
  defaultConfigurationRegister: { // Optional
    id: 0x0027, // 39
    type: ZCLDataTypes.map16(
      'enableLocalProgramming',
      'keypadInterfaceDefaultAccess',
      'rfInterfaceDefaultAccess',
      'reserved3',
      'reserved4',
      'soundEnabled',
      'autoRelockTimeSet',
      'ledSettingsSet',
    ),
  },
  enableLocalProgramming: { id: 0x0028, type: ZCLDataTypes.bool }, // 40, Optional
  enableOneTouchLocking: { id: 0x0029, type: ZCLDataTypes.bool }, // 41, Optional
  enableInsideStatusLED: { id: 0x002A, type: ZCLDataTypes.bool }, // 42, Optional
  enablePrivacyModeButton: { id: 0x002B, type: ZCLDataTypes.bool }, // 43, Optional

  // Security Settings (0x0030 - 0x003F)
  wrongCodeEntryLimit: { id: 0x0030, type: ZCLDataTypes.uint8 }, // 48, Optional
  userCodeTemporaryDisableTime: { id: 0x0031, type: ZCLDataTypes.uint8 }, // 49, Optional
  sendPINOverTheAir: { id: 0x0032, type: ZCLDataTypes.bool }, // 50, Optional
  requirePINforRFOperation: { id: 0x0033, type: ZCLDataTypes.bool }, // 51, Optional
  securityLevel: { // Optional
    id: 0x0034, // 52
    type: ZCLDataTypes.enum8({
      network: 0,
      apsSecurity: 1,
    }),
  },

  // Alarm and Event Masks (0x0040 - 0x004F)
  alarmMask: { // Optional
    id: 0x0040, // 64
    type: ZCLDataTypes.map16(
      'deadboltJammed',
      'lockResetToFactoryDefaults',
      'reserved2',
      'rfModulePowerCycled',
      'tamperAlarmWrongCodeEntryLimit',
      'tamperAlarmFrontEscutcheonRemoved',
      'forcedDoorOpenUnderDoorLockedCondition',
    ),
  },
  keypadOperationEventMask: { // Optional
    id: 0x0041, // 65
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificKeypadOperationEvent',
      'lockSourceKeypad',
      'unlockSourceKeypad',
      'lockSourceKeypadErrorInvalidPIN',
      'lockSourceKeypadErrorInvalidSchedule',
      'unlockSourceKeypadErrorInvalidCode',
      'unlockSourceKeypadErrorInvalidSchedule',
      'nonAccessUserOperationEventSourceKeypad',
    ),
  },
  rfOperationEventMask: { // Optional
    id: 0x0042, // 66
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificKeypadOperationEvent',
      'lockSourceRF',
      'unlockSourceRF',
      'lockSourceRFErrorInvalidCode',
      'lockSourceRFErrorInvalidSchedule',
      'unlockSourceRFErrorInvalidCode',
      'unlockSourceRFErrorInvalidSchedule',
    ),
  },
  manualOperationEventMask: { // Optional
    id: 0x0043, // 67
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificManualOperationEvent',
      'thumbturnLock',
      'thumbturnUnlock',
      'oneTouchLock',
      'keyLock',
      'keyUnlock',
      'autoLock',
      'scheduleLock',
      'scheduleUnlock',
      'manualLock',
      'manualUnlock',
    ),
  },
  rfidOperationEventMask: { // Optional
    id: 0x0044, // 68
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificKeypadOperationEvent',
      'lockSourceRFID',
      'unlockSourceRFID',
      'lockSourceRFIDErrorInvalidRFIDID',
      'lockSourceRFIDErrorInvalidSchedule',
      'unlockSourceRFIDErrorInvalidRFIDID',
      'unlockSourceRFIDErrorInvalidSchedule',
    ),
  },
  keypadProgrammingEventMask: { // Optional
    id: 0x0045, // 69
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificKeypadProgrammingEvent',
      'masterCodeChanged',
      'pinCodeAdded',
      'pinCodeDeleted',
      'pinCodeChanged',
    ),
  },
  rfProgrammingEventMask: { // Optional
    id: 0x0046, // 70
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificRFProgrammingEvent',
      'reserved1',
      'pinCodeAdded',
      'pinCodeDeleted',
      'pinCodeChanged',
      'rfidCodeAdded',
      'rfidCodeDeleted',
    ),
  },
  rfidProgrammingEventMask: { // Optional
    id: 0x0047, // 71
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificRFIDProgrammingEvent',
      'rfidCodeAdded',
      'rfidCodeDeleted',
    ),
  },
};

// Reusable enum definitions
const USER_STATUS_ENUM = ZCLDataTypes.enum8({
  available: 0,
  occupiedEnabled: 1,
  occupiedDisabled: 3,
  notSupported: 255,
});

const USER_TYPE_ENUM = ZCLDataTypes.enum8({
  unrestricted: 0,
  yearDayScheduleUser: 1,
  weekDayScheduleUser: 2,
  masterUser: 3,
  nonAccessUser: 4,
  notSupported: 255,
});

const OPERATING_MODE_ENUM = ZCLDataTypes.enum8({
  normal: 0,
  vacation: 1,
  privacy: 2,
  noRFLockOrUnlock: 3,
  passage: 4,
});

const COMMANDS = {
  // --- Client to Server Commands ---

  // Lock/Unlock Commands
  lockDoor: { // Mandatory
    id: 0x0000,
    args: {
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x0000,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  unlockDoor: { // Mandatory
    id: 0x0001,
    args: {
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x0001,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  toggle: { // Optional
    id: 0x0002,
    args: {
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x0002,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  unlockWithTimeout: { // Optional
    id: 0x0003,
    args: {
      timeout: ZCLDataTypes.uint16,
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x0003,
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // Logging Commands
  getLogRecord: { // Optional
    id: 0x0004,
    args: {
      logIndex: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0004,
      args: {
        logEntryId: ZCLDataTypes.uint16,
        timestamp: ZCLDataTypes.uint32,
        eventType: ZCLDataTypes.uint8,
        source: ZCLDataTypes.uint8,
        eventIdOrAlarmCode: ZCLDataTypes.uint8,
        userId: ZCLDataTypes.uint16,
        pin: ZCLDataTypes.octstr,
      },
    },
  },

  // PIN Code Commands
  setPINCode: { // Optional
    id: 0x0005,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: USER_STATUS_ENUM,
      userType: USER_TYPE_ENUM,
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x0005,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getPINCode: { // Optional
    id: 0x0006,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0006,
      args: {
        userId: ZCLDataTypes.uint16,
        userStatus: USER_STATUS_ENUM,
        userType: USER_TYPE_ENUM,
        pinCode: ZCLDataTypes.octstr,
      },
    },
  },
  clearPINCode: { // Optional
    id: 0x0007,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0007,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  clearAllPINCodes: { // Optional
    id: 0x0008,
    response: {
      id: 0x0008,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  setUserStatus: { // Optional
    id: 0x0009,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: USER_STATUS_ENUM,
    },
    response: {
      id: 0x0009,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getUserStatus: { // Optional
    id: 0x000A, // 10
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x000A, // 10
      args: {
        userId: ZCLDataTypes.uint16,
        userStatus: USER_STATUS_ENUM,
      },
    },
  },

  // Schedule Commands
  setWeekDaySchedule: { // Optional
    id: 0x000B, // 11
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
      daysMask: ZCLDataTypes.map8('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
      startHour: ZCLDataTypes.uint8,
      startMinute: ZCLDataTypes.uint8,
      endHour: ZCLDataTypes.uint8,
      endMinute: ZCLDataTypes.uint8,
    },
    response: {
      id: 0x000B, // 11
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getWeekDaySchedule: { // Optional
    id: 0x000C, // 12
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x000C, // 12
      args: {
        scheduleId: ZCLDataTypes.uint8,
        userId: ZCLDataTypes.uint16,
        status: ZCLDataTypes.uint8,
        daysMask: ZCLDataTypes.map8('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
        startHour: ZCLDataTypes.uint8,
        startMinute: ZCLDataTypes.uint8,
        endHour: ZCLDataTypes.uint8,
        endMinute: ZCLDataTypes.uint8,
      },
    },
  },
  clearWeekDaySchedule: { // Optional
    id: 0x000D, // 13
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x000D, // 13
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  setYearDaySchedule: { // Optional
    id: 0x000E, // 14
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
      localStartTime: ZCLDataTypes.uint32,
      localEndTime: ZCLDataTypes.uint32,
    },
    response: {
      id: 0x000E, // 14
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getYearDaySchedule: { // Optional
    id: 0x000F, // 15
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x000F, // 15
      args: {
        scheduleId: ZCLDataTypes.uint8,
        userId: ZCLDataTypes.uint16,
        status: ZCLDataTypes.uint8,
        localStartTime: ZCLDataTypes.uint32,
        localEndTime: ZCLDataTypes.uint32,
      },
    },
  },
  clearYearDaySchedule: { // Optional
    id: 0x0010, // 16
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0010, // 16
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  setHolidaySchedule: { // Optional
    id: 0x0011, // 17
    args: {
      holidayScheduleId: ZCLDataTypes.uint8,
      localStartTime: ZCLDataTypes.uint32,
      localEndTime: ZCLDataTypes.uint32,
      operatingModeDuringHoliday: OPERATING_MODE_ENUM,
    },
    response: {
      id: 0x0011, // 17
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getHolidaySchedule: { // Optional
    id: 0x0012, // 18
    args: {
      holidayScheduleId: ZCLDataTypes.uint8,
    },
    response: {
      id: 0x0012, // 18
      args: {
        holidayScheduleId: ZCLDataTypes.uint8,
        status: ZCLDataTypes.uint8,
        localStartTime: ZCLDataTypes.uint32,
        localEndTime: ZCLDataTypes.uint32,
        operatingMode: OPERATING_MODE_ENUM,
      },
    },
  },
  clearHolidaySchedule: { // Optional
    id: 0x0013, // 19
    args: {
      holidayScheduleId: ZCLDataTypes.uint8,
    },
    response: {
      id: 0x0013, // 19
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // User Type Commands
  setUserType: { // Optional
    id: 0x0014, // 20
    args: {
      userId: ZCLDataTypes.uint16,
      userType: USER_TYPE_ENUM,
    },
    response: {
      id: 0x0014, // 20
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getUserType: { // Optional
    id: 0x0015, // 21
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0015, // 21
      args: {
        userId: ZCLDataTypes.uint16,
        userType: USER_TYPE_ENUM,
      },
    },
  },

  // RFID Code Commands
  setRFIDCode: { // Optional
    id: 0x0016, // 22
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: USER_STATUS_ENUM,
      userType: USER_TYPE_ENUM,
      rfidCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x0016, // 22
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getRFIDCode: { // Optional
    id: 0x0017, // 23
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0017, // 23
      args: {
        userId: ZCLDataTypes.uint16,
        userStatus: USER_STATUS_ENUM,
        userType: USER_TYPE_ENUM,
        rfidCode: ZCLDataTypes.octstr,
      },
    },
  },
  clearRFIDCode: { // Optional
    id: 0x0018, // 24
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0018, // 24
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  clearAllRFIDCodes: { // Optional
    id: 0x0019, // 25
    response: {
      id: 0x0019, // 25
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // --- Server to Client Commands ---

  operationEventNotification: { // Optional
    id: 0x0020, // 32
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      operationEventSource: ZCLDataTypes.uint8,
      operationEventCode: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
      pin: ZCLDataTypes.octstr,
      zigBeeLocalTime: ZCLDataTypes.uint32,
      data: ZCLDataTypes.octstr,
    },
  },
  programmingEventNotification: { // Optional
    id: 0x0021, // 33
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      programEventSource: ZCLDataTypes.uint8,
      programEventCode: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
      pin: ZCLDataTypes.octstr,
      userType: USER_TYPE_ENUM,
      userStatus: USER_STATUS_ENUM,
      zigBeeLocalTime: ZCLDataTypes.uint32,
      data: ZCLDataTypes.octstr,
    },
  },
};

class DoorLockCluster extends Cluster {

  static get ID() {
    return 0x0101; // 257
  }

  static get NAME() {
    return 'doorLock';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(DoorLockCluster);

module.exports = DoorLockCluster;
