'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Lock Information (0x0000 - 0x000F)
  lockState: {
    id: 0x0000, // Mandatory
    type: ZCLDataTypes.enum8({
      notFullyLocked: 0,
      locked: 1,
      unlocked: 2,
      undefined: 255,
    }),
  },
  lockType: {
    id: 0x0001, // Mandatory
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
  doorState: {
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
  doorOpenEvents: { id: 0x0004, type: ZCLDataTypes.uint32 },
  doorClosedEvents: { id: 0x0005, type: ZCLDataTypes.uint32 },
  openPeriod: { id: 0x0006, type: ZCLDataTypes.uint16 },

  // User/PIN/RFID Configuration (0x0010 - 0x001F)
  numberOfLogRecordsSupported: { id: 0x0010, type: ZCLDataTypes.uint16 },
  numberOfTotalUsersSupported: { id: 0x0011, type: ZCLDataTypes.uint16 },
  numberOfPINUsersSupported: { id: 0x0012, type: ZCLDataTypes.uint16 },
  numberOfRFIDUsersSupported: { id: 0x0013, type: ZCLDataTypes.uint16 },
  numberOfWeekDaySchedulesSupportedPerUser: { id: 0x0014, type: ZCLDataTypes.uint8 },
  numberOfYearDaySchedulesSupportedPerUser: { id: 0x0015, type: ZCLDataTypes.uint8 },
  numberOfHolidaySchedulesSupported: { id: 0x0016, type: ZCLDataTypes.uint8 },
  maxPINCodeLength: { id: 0x0017, type: ZCLDataTypes.uint8 },
  minPINCodeLength: { id: 0x0018, type: ZCLDataTypes.uint8 },
  maxRFIDCodeLength: { id: 0x0019, type: ZCLDataTypes.uint8 },
  minRFIDCodeLength: { id: 0x001A, type: ZCLDataTypes.uint8 },

  // Operational Settings (0x0020 - 0x002F)
  enableLogging: { id: 0x0020, type: ZCLDataTypes.bool },
  language: { id: 0x0021, type: ZCLDataTypes.string },
  ledSettings: { id: 0x0022, type: ZCLDataTypes.uint8 },
  autoRelockTime: { id: 0x0023, type: ZCLDataTypes.uint32 },
  soundVolume: { id: 0x0024, type: ZCLDataTypes.uint8 },
  operatingMode: {
    id: 0x0025,
    type: ZCLDataTypes.enum8({
      normal: 0,
      vacation: 1,
      privacy: 2,
      noRFLockOrUnlock: 3,
      passage: 4,
    }),
  },
  supportedOperatingModes: {
    id: 0x0026,
    type: ZCLDataTypes.map16(
      'normal',
      'vacation',
      'privacy',
      'noRFLockOrUnlock',
      'passage',
    ),
  },
  defaultConfigurationRegister: {
    id: 0x0027,
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
  enableLocalProgramming: { id: 0x0028, type: ZCLDataTypes.bool },
  enableOneTouchLocking: { id: 0x0029, type: ZCLDataTypes.bool },
  enableInsideStatusLED: { id: 0x002A, type: ZCLDataTypes.bool },
  enablePrivacyModeButton: { id: 0x002B, type: ZCLDataTypes.bool },

  // Security Settings (0x0030 - 0x003F)
  wrongCodeEntryLimit: { id: 0x0030, type: ZCLDataTypes.uint8 },
  userCodeTemporaryDisableTime: { id: 0x0031, type: ZCLDataTypes.uint8 },
  sendPINOverTheAir: { id: 0x0032, type: ZCLDataTypes.bool },
  requirePINforRFOperation: { id: 0x0033, type: ZCLDataTypes.bool },
  securityLevel: {
    id: 0x0034,
    type: ZCLDataTypes.enum8({
      network: 0,
      apsSecurity: 1,
    }),
  },

  // Alarm and Event Masks (0x0040 - 0x004F)
  alarmMask: {
    id: 0x0040,
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
  keypadOperationEventMask: {
    id: 0x0041,
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
  rfOperationEventMask: {
    id: 0x0042,
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
  manualOperationEventMask: {
    id: 0x0043,
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
  rfidOperationEventMask: {
    id: 0x0044,
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
  keypadProgrammingEventMask: {
    id: 0x0045,
    type: ZCLDataTypes.map16(
      'unknownOrManufacturerSpecificKeypadProgrammingEvent',
      'masterCodeChanged',
      'pinCodeAdded',
      'pinCodeDeleted',
      'pinCodeChanged',
    ),
  },
  rfProgrammingEventMask: {
    id: 0x0046,
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
  rfidProgrammingEventMask: {
    id: 0x0047,
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
  // Lock/Unlock Commands
  lockDoor: {
    id: 0x00, // Mandatory
    args: {
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x00,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  unlockDoor: {
    id: 0x01, // Mandatory
    args: {
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x01,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  toggle: {
    id: 0x02,
    args: {
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x02,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  unlockWithTimeout: {
    id: 0x03,
    args: {
      timeout: ZCLDataTypes.uint16,
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x03,
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // Logging Commands
  getLogRecord: {
    id: 0x04,
    args: {
      logIndex: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x04,
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
  setPINCode: {
    id: 0x05,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: USER_STATUS_ENUM,
      userType: USER_TYPE_ENUM,
      pinCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x05,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getPINCode: {
    id: 0x06,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x06,
      args: {
        userId: ZCLDataTypes.uint16,
        userStatus: USER_STATUS_ENUM,
        userType: USER_TYPE_ENUM,
        pinCode: ZCLDataTypes.octstr,
      },
    },
  },
  clearPINCode: {
    id: 0x07,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x07,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  clearAllPINCodes: {
    id: 0x08,
    response: {
      id: 0x08,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  setUserStatus: {
    id: 0x09,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: USER_STATUS_ENUM,
    },
    response: {
      id: 0x09,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getUserStatus: {
    id: 0x0A,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0A,
      args: {
        userId: ZCLDataTypes.uint16,
        userStatus: USER_STATUS_ENUM,
      },
    },
  },

  // Schedule Commands
  setWeekDaySchedule: {
    id: 0x0B,
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
      id: 0x0B,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getWeekDaySchedule: {
    id: 0x0C,
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0C,
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
  clearWeekDaySchedule: {
    id: 0x0D,
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0D,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  setYearDaySchedule: {
    id: 0x0E,
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
      localStartTime: ZCLDataTypes.uint32,
      localEndTime: ZCLDataTypes.uint32,
    },
    response: {
      id: 0x0E,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getYearDaySchedule: {
    id: 0x0F,
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x0F,
      args: {
        scheduleId: ZCLDataTypes.uint8,
        userId: ZCLDataTypes.uint16,
        status: ZCLDataTypes.uint8,
        localStartTime: ZCLDataTypes.uint32,
        localEndTime: ZCLDataTypes.uint32,
      },
    },
  },
  clearYearDaySchedule: {
    id: 0x10,
    args: {
      scheduleId: ZCLDataTypes.uint8,
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x10,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  setHolidaySchedule: {
    id: 0x11,
    args: {
      holidayScheduleId: ZCLDataTypes.uint8,
      localStartTime: ZCLDataTypes.uint32,
      localEndTime: ZCLDataTypes.uint32,
      operatingModeDuringHoliday: OPERATING_MODE_ENUM,
    },
    response: {
      id: 0x11,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getHolidaySchedule: {
    id: 0x12,
    args: {
      holidayScheduleId: ZCLDataTypes.uint8,
    },
    response: {
      id: 0x12,
      args: {
        holidayScheduleId: ZCLDataTypes.uint8,
        status: ZCLDataTypes.uint8,
        localStartTime: ZCLDataTypes.uint32,
        localEndTime: ZCLDataTypes.uint32,
        operatingMode: OPERATING_MODE_ENUM,
      },
    },
  },
  clearHolidaySchedule: {
    id: 0x13,
    args: {
      holidayScheduleId: ZCLDataTypes.uint8,
    },
    response: {
      id: 0x13,
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // User Type Commands
  setUserType: {
    id: 0x14,
    args: {
      userId: ZCLDataTypes.uint16,
      userType: USER_TYPE_ENUM,
    },
    response: {
      id: 0x14,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getUserType: {
    id: 0x15,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x15,
      args: {
        userId: ZCLDataTypes.uint16,
        userType: USER_TYPE_ENUM,
      },
    },
  },

  // RFID Code Commands
  setRFIDCode: {
    id: 0x16,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: USER_STATUS_ENUM,
      userType: USER_TYPE_ENUM,
      rfidCode: ZCLDataTypes.octstr,
    },
    response: {
      id: 0x16,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  getRFIDCode: {
    id: 0x17,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x17,
      args: {
        userId: ZCLDataTypes.uint16,
        userStatus: USER_STATUS_ENUM,
        userType: USER_TYPE_ENUM,
        rfidCode: ZCLDataTypes.octstr,
      },
    },
  },
  clearRFIDCode: {
    id: 0x18,
    args: {
      userId: ZCLDataTypes.uint16,
    },
    response: {
      id: 0x18,
      args: { status: ZCLDataTypes.uint8 },
    },
  },
  clearAllRFIDCodes: {
    id: 0x19,
    response: {
      id: 0x19,
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // Unsolicited notifications (server to client)
  operationEventNotification: {
    id: 0x20,
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
  programmingEventNotification: {
    id: 0x21,
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
    return 257; // 0x0101
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
