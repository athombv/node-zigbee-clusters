declare module "zigbee-clusters" {
  import {Bitmap} from "@athombv/data-types";
  type BasicClusterAttributes = {
    zclVersion: { id: 0x00, type: ZCLDataType<number> },
    appVersion: { id: 0x01, type: ZCLDataType<number> },
    stackVersion: { id: 0x02, type: ZCLDataType<number> },
    hwVersion: { id: 0x03, type: ZCLDataType<number> },
    manufacturerName: { id: 0x04, type: ZCLDataType<string> },
    modelId: { id: 0x05, type: ZCLDataType<string> },
    dateCode: { id: 0x06, type: ZCLDataType<string> },
    powerSource: { id: 0x07, type: ZCLDataType<"unknown" | "mains" | "mains3phase" | "battery" | "dc" | "emergencyMains" | "emergencyTransfer"> },
    appProfileVersion: { id: 0x08, type: ZCLDataType<number> },
    locationDesc: { id: 0x10, type: ZCLDataType<string> },
    physicalEnv: { id: 0x11, type: ZCLDataType<"Unspecified" | "Atrium" | "Bar" | "Courtyard" | "Bathroom" | "Bedroom" | "BilliardRoom" | "UtilityRoom" | "Cellar" | "StorageCloset" | "Theater" | "Office" | "Deck" | "Den" | "DiningRoom" | "ElectricalRoom" | "Elevator" | "Entry" | "FamilyRoom" | "MainFloor" | "Upstairs" | "Downstairs" | "Basement" | "Gallery" | "GameRoom" | "Garage" | "Gym" | "Hallway" | "House" | "Kitchen" | "LaundryRoom" | "Library" | "MasterBedroom" | "MudRoom" | "Nursery" | "Pantry" | "Outside" | "Pool" | "Porch" | "SewingRoom" | "SittingRoom" | "Stairway" | "Yard" | "Attic" | "HotTub" | "LivingRoom" | "Sauna" | "Workshop" | "GuestBedroom" | "GuestBath" | "PowderRoom" | "BackYard" | "FrontYard" | "Patio" | "Driveway" | "SunRoom" | "Spa" | "Whirlpool" | "Shed" | "EquipmentStorage" | "HobbyRoom" | "Fountain" | "Pond" | "ReceptionRoom" | "BreakfastRoom" | "Nook" | "Garden" | "Balcony" | "PanicRoom" | "Terrace" | "Roof" | "Toilet" | "ToiletMain" | "OutsideToilet" | "ShowerRoom" | "Study" | "FrontGarden" | "BackGarden" | "Kettle" | "Television" | "Stove" | "Microwave" | "Toaster" | "Vacuum" | "Appliance" | "FrontDoor" | "BackDoor" | "FridgeDoor" | "MedicationCabinetDoor" | "WardrobeDoor" | "FrontCupboardDoor" | "OtherDoor" | "WaitingRoom" | "TriageRoom" | "DoctorsOffice" | "PatientsPrivateRoom" | "ConsultationRoom" | "NurseStation" | "Ward" | "Corridor" | "OperatingTheatre" | "DentalSurgeryRoom" | "MedicalImagingRoom" | "DecontaminationRoom" | "Unknown"> },
    deviceEnabled: { id: 0x12, type: ZCLDataType<boolean> },
    alarmMask: { id: 0x13, type: ZCLDataType<Bitmap<"hardwareFault" | "softwareFault">> },
    disableLocalConfig: { id: 0x14, type: ZCLDataType<Bitmap<"factoryResetDisabled" | "configurationDisabled">> },
    swBuildId: { id: 0x4000, type: ZCLDataType<string> },
  };
  type BasicClusterCommands = {
    factoryReset: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT" },
  };
  class BasicCluster<Attributes extends types.AttributeDefinitions = BasicClusterAttributes, Commands extends types.CommandDefinitions = BasicClusterCommands> extends Cluster<Attributes, Commands> {
    factoryReset(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type PowerConfigurationClusterAttributes = {
    batteryVoltage: { id: 0x20, type: ZCLDataType<number> },
    batteryPercentageRemaining: { id: 0x21, type: ZCLDataType<number> },
    batterySize: { id: 0x31, type: ZCLDataType<"noBattery" | "builtIn" | "other" | "AA" | "AAA" | "C" | "D" | "CR2" | "CR123A" | "unknown"> },
    batteryQuantity: { id: 0x33, type: ZCLDataType<number> },
    batteryRatedVoltage: { id: 0x34, type: ZCLDataType<number> },
    batteryVoltageMinThreshold: { id: 0x36, type: ZCLDataType<number> },
    batteryAlarmState: { id: 0x3e, type: ZCLDataType<Bitmap<"batteryThresholdBatterySource1" | "batteryThreshold1BatterySource1" | "batteryThreshold2BatterySource1" | "batteryThreshold3BatterySource1" | "reserved4" | "reserved5" | "reserved6" | "reserved7" | "reserved8" | "reserved9" | "batteryThresholdBatterySource2" | "batteryThreshold1BatterySource2" | "batteryThreshold2BatterySource2" | "batteryThreshold3BatterySource2" | "reserved14" | "reserved15" | "reserved16" | "reserved17" | "reserved18" | "reserved19" | "batteryThresholdBatterySource3" | "batteryThreshold1BatterySource3" | "batteryThreshold2BatterySource3" | "batteryThreshold3BatterySource3" | "reserved24" | "reserved25" | "reserved26" | "reserved27" | "reserved28" | "reserved29" | "mainsPowerSupplyLostUnavailable">> },
  };
  type PowerConfigurationClusterCommands = Record<never, never>;
  class PowerConfigurationCluster<Attributes extends types.AttributeDefinitions = PowerConfigurationClusterAttributes, Commands extends types.CommandDefinitions = PowerConfigurationClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type DeviceTemperatureClusterAttributes = {
    currentTemperature: { id: 0x00, type: ZCLDataType<number> },
    minTempExperienced: { id: 0x01, type: ZCLDataType<number> },
    maxTempExperienced: { id: 0x02, type: ZCLDataType<number> },
    overTempTotalDwell: { id: 0x03, type: ZCLDataType<number> },
    deviceTempAlarmMask: { id: 0x10, type: ZCLDataType<Bitmap<"deviceTemperatureTooLow" | "deviceTemperatureTooHigh">> },
    lowTempThreshold: { id: 0x11, type: ZCLDataType<number> },
    highTempThreshold: { id: 0x12, type: ZCLDataType<number> },
    lowTempDwellTripPoint: { id: 0x13, type: ZCLDataType<number> },
    highTempDwellTripPoint: { id: 0x14, type: ZCLDataType<number> },
  };
  type DeviceTemperatureClusterCommands = Record<never, never>;
  class DeviceTemperatureCluster<Attributes extends types.AttributeDefinitions = DeviceTemperatureClusterAttributes, Commands extends types.CommandDefinitions = DeviceTemperatureClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type IdentifyClusterAttributes = {
    identifyTime: { id: 0x00, type: ZCLDataType<number> },
  };
  type IdentifyClusterCommands = {
    identify: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        identifyTime: ZCLDataType<number>,
      },
    },
    identifyQuery: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT" },
    triggerEffect: { id: 0x40, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        effectIdentifier: ZCLDataType<"blink" | "breathe" | "okay" | "channelChange" | "finish" | "stop">,
        effectVariant: ZCLDataType<number>,
      },
    },
  };
  class IdentifyCluster<Attributes extends types.AttributeDefinitions = IdentifyClusterAttributes, Commands extends types.CommandDefinitions = IdentifyClusterCommands> extends Cluster<Attributes, Commands> {
    identify(
      args: {
        manufacturerId?: number,
        identifyTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    identifyQuery(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      timeout: number,
    }>;
    triggerEffect(
      args: {
        manufacturerId?: number,
        effectIdentifier?: "blink" | "breathe" | "okay" | "channelChange" | "finish" | "stop",
        effectVariant?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type GroupsClusterAttributes = {
    nameSupport: { id: 0x00, type: ZCLDataType<Bitmap<null | null | null | null | null | null | null | "groupNames">> },
  };
  type GroupsClusterCommands = {
    addGroup: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        groupId: ZCLDataType<number>,
        groupName: ZCLDataType<string>,
      },
    },
    viewGroup: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        groupId: ZCLDataType<number>,
      },
    },
    getGroupMembership: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        groupIds: ZCLDataType<Array<number>>,
      },
    },
    removeGroup: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        groupId: ZCLDataType<number>,
      },
    },
    removeAllGroups: { id: 0x04, direction: "DIRECTION_SERVER_TO_CLIENT" },
    addGroupIfIdentify: { id: 0x05, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        groupId: ZCLDataType<number>,
        groupName: ZCLDataType<string>,
      },
    },
  };
  class GroupsCluster<Attributes extends types.AttributeDefinitions = GroupsClusterAttributes, Commands extends types.CommandDefinitions = GroupsClusterCommands> extends Cluster<Attributes, Commands> {
    addGroup(
      args: {
        manufacturerId?: number,
        groupId?: number,
        groupName?: string,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: types.ZCLEnum8Status,
      groupId: number,
    }>;
    viewGroup(
      args: {
        manufacturerId?: number,
        groupId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: types.ZCLEnum8Status,
      groupId: number,
      groupNames: string,
    }>;
    getGroupMembership(
      args: {
        manufacturerId?: number,
        groupIds?: Array<number>,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      capacity: number,
      groups: Array<number>,
    }>;
    removeGroup(
      args: {
        manufacturerId?: number,
        groupId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: types.ZCLEnum8Status,
      groupId: number,
    }>;
    removeAllGroups(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    addGroupIfIdentify(
      args: {
        manufacturerId?: number,
        groupId?: number,
        groupName?: string,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type ScenesClusterAttributes = Record<never, never>;
  type ScenesClusterCommands = Record<never, never>;
  class ScenesCluster<Attributes extends types.AttributeDefinitions = ScenesClusterAttributes, Commands extends types.CommandDefinitions = ScenesClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type OnOffClusterAttributes = {
    onOff: { id: 0x00, type: ZCLDataType<boolean> },
    onTime: { id: 0x4001, type: ZCLDataType<number> },
    offWaitTime: { id: 0x4002, type: ZCLDataType<number> },
  };
  type OnOffClusterCommands = {
    setOff: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT" },
    setOn: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT" },
    toggle: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT" },
    offWithEffect: { id: 0x40, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        effectIdentifier: ZCLDataType<number>,
        effectVariant: ZCLDataType<number>,
      },
    },
    onWithRecallGlobalScene: { id: 0x41, direction: "DIRECTION_SERVER_TO_CLIENT" },
    onWithTimedOff: { id: 0x42, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        onOffControl: ZCLDataType<number>,
        onTime: ZCLDataType<number>,
        offWaitTime: ZCLDataType<number>,
      },
    },
  };
  class OnOffCluster<Attributes extends types.AttributeDefinitions = OnOffClusterAttributes, Commands extends types.CommandDefinitions = OnOffClusterCommands> extends Cluster<Attributes, Commands> {
    setOff(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    setOn(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    toggle(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    offWithEffect(
      args: {
        manufacturerId?: number,
        effectIdentifier?: number,
        effectVariant?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    onWithRecallGlobalScene(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    onWithTimedOff(
      args: {
        manufacturerId?: number,
        onOffControl?: number,
        onTime?: number,
        offWaitTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type OnOffSwitchClusterAttributes = Record<never, never>;
  type OnOffSwitchClusterCommands = Record<never, never>;
  class OnOffSwitchCluster<Attributes extends types.AttributeDefinitions = OnOffSwitchClusterAttributes, Commands extends types.CommandDefinitions = OnOffSwitchClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type LevelControlClusterAttributes = {
    currentLevel: { id: 0x00, type: ZCLDataType<number> },
    remainingTime: { id: 0x01, type: ZCLDataType<number> },
    onOffTransitionTime: { id: 0x10, type: ZCLDataType<number> },
    onLevel: { id: 0x11, type: ZCLDataType<number> },
    onTransitionTime: { id: 0x12, type: ZCLDataType<number> },
    offTransitionTime: { id: 0x13, type: ZCLDataType<number> },
    defaultMoveRate: { id: 0x14, type: ZCLDataType<number> },
  };
  type LevelControlClusterCommands = {
    moveToLevel: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        level: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    move: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        moveMode: ZCLDataType<"up" | "down">,
        rate: ZCLDataType<number>,
      },
    },
    step: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        mode: ZCLDataType<"up" | "down">,
        stepSize: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    stop: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT" },
    moveToLevelWithOnOff: { id: 0x04, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        level: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    moveWithOnOff: { id: 0x05, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        moveMode: ZCLDataType<"up" | "down">,
        rate: ZCLDataType<number>,
      },
    },
    stepWithOnOff: { id: 0x06, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        mode: ZCLDataType<"up" | "down">,
        stepSize: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    stopWithOnOff: { id: 0x07, direction: "DIRECTION_SERVER_TO_CLIENT" },
  };
  class LevelControlCluster<Attributes extends types.AttributeDefinitions = LevelControlClusterAttributes, Commands extends types.CommandDefinitions = LevelControlClusterCommands> extends Cluster<Attributes, Commands> {
    moveToLevel(
      args: {
        manufacturerId?: number,
        level?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    move(
      args: {
        manufacturerId?: number,
        moveMode?: "up" | "down",
        rate?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    step(
      args: {
        manufacturerId?: number,
        mode?: "up" | "down",
        stepSize?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    stop(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    moveToLevelWithOnOff(
      args: {
        manufacturerId?: number,
        level?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    moveWithOnOff(
      args: {
        manufacturerId?: number,
        moveMode?: "up" | "down",
        rate?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    stepWithOnOff(
      args: {
        manufacturerId?: number,
        mode?: "up" | "down",
        stepSize?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    stopWithOnOff(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type AlarmsClusterAttributes = Record<never, never>;
  type AlarmsClusterCommands = {
    resetAllAlarms: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT", args: Record<never, never> /* TODO fix */ },
    getAlarm: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT", args: Record<never, never> /* TODO fix */ },
    resetAlarmLog: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT", args: Record<never, never> /* TODO fix */ },
  };
  class AlarmsCluster<Attributes extends types.AttributeDefinitions = AlarmsClusterAttributes, Commands extends types.CommandDefinitions = AlarmsClusterCommands> extends Cluster<Attributes, Commands> {
    resetAllAlarms(
      args: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    getAlarm(
      args: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    resetAlarmLog(
      args: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type TimeClusterAttributes = Record<never, never>;
  type TimeClusterCommands = Record<never, never>;
  class TimeCluster<Attributes extends types.AttributeDefinitions = TimeClusterAttributes, Commands extends types.CommandDefinitions = TimeClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type AnalogInputClusterAttributes = {
    description: { id: 0x1c, type: ZCLDataType<string> },
    maxPresentValue: { id: 0x41, type: ZCLDataType<number> },
    minPresentValue: { id: 0x45, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    presentValue: { id: 0x55, type: ZCLDataType<number> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "noSensor" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "noOutput" | "unreliableOther" | "processError" | "configurationError"> },
    resolution: { id: 0x6a, type: ZCLDataType<number> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type AnalogInputClusterCommands = Record<never, never>;
  class AnalogInputCluster<Attributes extends types.AttributeDefinitions = AnalogInputClusterAttributes, Commands extends types.CommandDefinitions = AnalogInputClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type AnalogOutputClusterAttributes = {
    description: { id: 0x1c, type: ZCLDataType<string> },
    maxPresentValue: { id: 0x41, type: ZCLDataType<number> },
    minPresentValue: { id: 0x45, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    presentValue: { id: 0x55, type: ZCLDataType<number> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "unreliableOther" | "processError" | "configurationError"> },
    relinquishDefault: { id: 0x68, type: ZCLDataType<number> },
    resolution: { id: 0x6a, type: ZCLDataType<number> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type AnalogOutputClusterCommands = Record<never, never>;
  class AnalogOutputCluster<Attributes extends types.AttributeDefinitions = AnalogOutputClusterAttributes, Commands extends types.CommandDefinitions = AnalogOutputClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type AnalogValueClusterAttributes = {
    description: { id: 0x1c, type: ZCLDataType<string> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    presentValue: { id: 0x55, type: ZCLDataType<number> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "unreliableOther" | "processError" | "configurationError"> },
    relinquishDefault: { id: 0x68, type: ZCLDataType<number> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type AnalogValueClusterCommands = Record<never, never>;
  class AnalogValueCluster<Attributes extends types.AttributeDefinitions = AnalogValueClusterAttributes, Commands extends types.CommandDefinitions = AnalogValueClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type BinaryInputClusterAttributes = {
    activeText: { id: 0x04, type: ZCLDataType<string> },
    description: { id: 0x1c, type: ZCLDataType<string> },
    inactiveText: { id: 0x2e, type: ZCLDataType<string> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    polarity: { id: 0x54, type: ZCLDataType<"normal" | "reverse"> },
    presentValue: { id: 0x55, type: ZCLDataType<boolean> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "noSensor" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "noOutput" | "unreliableOther" | "processError" | "configurationError"> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type BinaryInputClusterCommands = Record<never, never>;
  class BinaryInputCluster<Attributes extends types.AttributeDefinitions = BinaryInputClusterAttributes, Commands extends types.CommandDefinitions = BinaryInputClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type BinaryOutputClusterAttributes = {
    activeText: { id: 0x04, type: ZCLDataType<string> },
    description: { id: 0x1c, type: ZCLDataType<string> },
    inactiveText: { id: 0x2e, type: ZCLDataType<string> },
    minimumOffTime: { id: 0x42, type: ZCLDataType<number> },
    minimumOnTime: { id: 0x43, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    polarity: { id: 0x54, type: ZCLDataType<"normal" | "reverse"> },
    presentValue: { id: 0x55, type: ZCLDataType<boolean> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "unreliableOther" | "processError" | "configurationError"> },
    relinquishDefault: { id: 0x68, type: ZCLDataType<boolean> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type BinaryOutputClusterCommands = Record<never, never>;
  class BinaryOutputCluster<Attributes extends types.AttributeDefinitions = BinaryOutputClusterAttributes, Commands extends types.CommandDefinitions = BinaryOutputClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type BinaryValueClusterAttributes = {
    activeText: { id: 0x04, type: ZCLDataType<string> },
    description: { id: 0x1c, type: ZCLDataType<string> },
    inactiveText: { id: 0x2e, type: ZCLDataType<string> },
    minimumOffTime: { id: 0x42, type: ZCLDataType<number> },
    minimumOnTime: { id: 0x43, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    polarity: { id: 0x54, type: ZCLDataType<"normal" | "reverse"> },
    presentValue: { id: 0x55, type: ZCLDataType<boolean> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "unreliableOther" | "processError" | "configurationError"> },
    relinquishDefault: { id: 0x68, type: ZCLDataType<boolean> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type BinaryValueClusterCommands = Record<never, never>;
  class BinaryValueCluster<Attributes extends types.AttributeDefinitions = BinaryValueClusterAttributes, Commands extends types.CommandDefinitions = BinaryValueClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type MultistateInputClusterAttributes = {
    description: { id: 0x1c, type: ZCLDataType<string> },
    numberOfStates: { id: 0x4a, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    presentValue: { id: 0x55, type: ZCLDataType<number> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "noSensor" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "noOutput" | "unreliableOther" | "processError" | "multiStateFault" | "configurationError"> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type MultistateInputClusterCommands = Record<never, never>;
  class MultistateInputCluster<Attributes extends types.AttributeDefinitions = MultistateInputClusterAttributes, Commands extends types.CommandDefinitions = MultistateInputClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type MultistateOutputClusterAttributes = {
    description: { id: 0x1c, type: ZCLDataType<string> },
    numberOfStates: { id: 0x4a, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    presentValue: { id: 0x55, type: ZCLDataType<number> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "unreliableOther" | "processError" | "multiStateFault" | "configurationError"> },
    relinquishDefault: { id: 0x68, type: ZCLDataType<number> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type MultistateOutputClusterCommands = Record<never, never>;
  class MultistateOutputCluster<Attributes extends types.AttributeDefinitions = MultistateOutputClusterAttributes, Commands extends types.CommandDefinitions = MultistateOutputClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type MultistateValueClusterAttributes = {
    description: { id: 0x1c, type: ZCLDataType<string> },
    numberOfStates: { id: 0x4a, type: ZCLDataType<number> },
    outOfService: { id: 0x51, type: ZCLDataType<boolean> },
    presentValue: { id: 0x55, type: ZCLDataType<number> },
    reliability: { id: 0x67, type: ZCLDataType<"noFaultDetected" | "noSensor" | "overRange" | "underRange" | "openLoop" | "shortedLoop" | "noOutput" | "unreliableOther" | "processError" | "multiStateFault" | "configurationError"> },
    relinquishDefault: { id: 0x68, type: ZCLDataType<number> },
    statusFlags: { id: 0x6f, type: ZCLDataType<Bitmap<"inAlarm" | "fault" | "overridden" | "outOfService">> },
    applicationType: { id: 0x100, type: ZCLDataType<number> },
  };
  type MultistateValueClusterCommands = Record<never, never>;
  class MultistateValueCluster<Attributes extends types.AttributeDefinitions = MultistateValueClusterAttributes, Commands extends types.CommandDefinitions = MultistateValueClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type OTAClusterAttributes = {
    upgradeServerID: { id: 0x00, type: ZCLDataType<string> },
    fileOffset: { id: 0x01, type: ZCLDataType<number> },
    currentFileVersion: { id: 0x02, type: ZCLDataType<number> },
    currentZigBeeStackVersion: { id: 0x03, type: ZCLDataType<number> },
    downloadedFileVersion: { id: 0x04, type: ZCLDataType<number> },
    downloadedZigBeeStackVersion: { id: 0x05, type: ZCLDataType<number> },
    imageUpgradeStatus: { id: 0x06, type: ZCLDataType<"normal" | "downloadInProgress" | "downloadComplete" | "waitingToUpgrade" | "countDown" | "waitForMore" | "waitingToUpgradeViaExternalEvent"> },
    manufacturerID: { id: 0x07, type: ZCLDataType<number> },
    imageTypeID: { id: 0x08, type: ZCLDataType<number> },
    minimumBlockPeriod: { id: 0x09, type: ZCLDataType<number> },
    imageStamp: { id: 0x0a, type: ZCLDataType<number> },
    upgradeActivationPolicy: { id: 0x0b, type: ZCLDataType<"otaServerActivationAllowed" | "outOfBandActivationOnly"> },
    upgradeTimeoutPolicy: { id: 0x0c, type: ZCLDataType<"applyUpgradeAfterTimeout" | "doNotApplyUpgradeAfterTimeout"> },
  };
  type OTAClusterCommands = {
    imageNotify: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", frameControl: ["directionToClient","clusterSpecific","disableDefaultResponse"], encodeMissingFieldsBehavior: "skip", args: {
        payloadType: ZCLDataType<"queryJitter" | "queryJitterAndManufacturerCode" | "queryJitterAndManufacturerCodeAndImageType" | "queryJitterAndManufacturerCodeAndImageTypeAndNewFileVersion">,
        queryJitter: ZCLDataType<number>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        newFileVersion: ZCLDataType<number>,
      },
    },
    queryNextImageRequest: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT", encodeMissingFieldsBehavior: "skip", args: {
        fieldControl: ZCLDataType<Bitmap<"hardwareVersionPresent">>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
        hardwareVersion: ZCLDataType<number>,
      },
    },
    imageBlockRequest: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT", encodeMissingFieldsBehavior: "skip", args: {
        fieldControl: ZCLDataType<Bitmap<"requestNodeAddressPresent" | "minimumBlockPeriodPresent">>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
        fileOffset: ZCLDataType<number>,
        maximumDataSize: ZCLDataType<number>,
        requestNodeAddress: ZCLDataType<string>,
        minimumBlockPeriod: ZCLDataType<number>,
      },
    },
    imagePageRequest: { id: 0x04, direction: "DIRECTION_SERVER_TO_CLIENT", encodeMissingFieldsBehavior: "skip", args: {
        fieldControl: ZCLDataType<Bitmap<"requestNodeAddressPresent">>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
        fileOffset: ZCLDataType<number>,
        maximumDataSize: ZCLDataType<number>,
        pageSize: ZCLDataType<number>,
        responseSpacing: ZCLDataType<number>,
        requestNodeAddress: ZCLDataType<string>,
      },
    },
    imageBlockResponse: { id: 0x05, direction: "DIRECTION_SERVER_TO_CLIENT", frameControl: ["directionToClient","clusterSpecific","disableDefaultResponse"], encodeMissingFieldsBehavior: "skip", args: {
        status: ZCLDataType<types.ZCLEnum8Status>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
        fileOffset: ZCLDataType<number>,
        dataSize: ZCLDataType<number>,
        imageData: ZCLDataType<Buffer>,
        currentTime: ZCLDataType<number>,
        requestTime: ZCLDataType<number>,
        minimumBlockPeriod: ZCLDataType<number>,
      },
    },
    upgradeEndRequest: { id: 0x06, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        status: ZCLDataType<types.ZCLEnum8Status>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
      },
    },
    upgradeEndResponse: { id: 0x07, direction: "DIRECTION_SERVER_TO_CLIENT", frameControl: ["directionToClient","clusterSpecific","disableDefaultResponse"], args: {
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
        currentTime: ZCLDataType<number>,
        upgradeTime: ZCLDataType<number>,
      },
    },
    queryDeviceSpecificFileRequest: { id: 0x08, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        requestNodeAddress: ZCLDataType<string>,
        manufacturerCode: ZCLDataType<number>,
        imageType: ZCLDataType<number>,
        fileVersion: ZCLDataType<number>,
        zigBeeStackVersion: ZCLDataType<number>,
      },
    },
  };
  class OTACluster<Attributes extends types.AttributeDefinitions = OTAClusterAttributes, Commands extends types.CommandDefinitions = OTAClusterCommands> extends Cluster<Attributes, Commands> {
    onImageNotify(
      args?: {
        manufacturerId?: number,
        payloadType?: "queryJitter" | "queryJitterAndManufacturerCode" | "queryJitterAndManufacturerCodeAndImageType" | "queryJitterAndManufacturerCodeAndImageTypeAndNewFileVersion",
        queryJitter?: number,
        manufacturerCode?: number,
        imageType?: number,
        newFileVersion?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    queryNextImageRequest(
      args?: {
        manufacturerId?: number,
        fieldControl?: Bitmap<"hardwareVersionPresent">,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
        hardwareVersion?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status?: types.ZCLEnum8Status,
      manufacturerCode?: number,
      imageType?: number,
      fileVersion?: number,
      imageSize?: number,
    }>;
    imageBlockRequest(
      args?: {
        manufacturerId?: number,
        fieldControl?: Bitmap<"requestNodeAddressPresent" | "minimumBlockPeriodPresent">,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
        fileOffset?: number,
        maximumDataSize?: number,
        requestNodeAddress?: string,
        minimumBlockPeriod?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status?: types.ZCLEnum8Status,
      manufacturerCode?: number,
      imageType?: number,
      fileVersion?: number,
      fileOffset?: number,
      dataSize?: number,
      imageData?: Buffer,
      currentTime?: number,
      requestTime?: number,
      minimumBlockPeriod?: number,
    }>;
    imagePageRequest(
      args?: {
        manufacturerId?: number,
        fieldControl?: Bitmap<"requestNodeAddressPresent">,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
        fileOffset?: number,
        maximumDataSize?: number,
        pageSize?: number,
        responseSpacing?: number,
        requestNodeAddress?: string,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status?: types.ZCLEnum8Status,
      manufacturerCode?: number,
      imageType?: number,
      fileVersion?: number,
      fileOffset?: number,
      dataSize?: number,
      imageData?: Buffer,
      currentTime?: number,
      requestTime?: number,
      minimumBlockPeriod?: number,
    }>;
    onImageBlockResponse(
      args?: {
        manufacturerId?: number,
        status?: types.ZCLEnum8Status,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
        fileOffset?: number,
        dataSize?: number,
        imageData?: Buffer,
        currentTime?: number,
        requestTime?: number,
        minimumBlockPeriod?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    upgradeEndRequest(
      args: {
        manufacturerId?: number,
        status?: types.ZCLEnum8Status,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      manufacturerCode: number,
      imageType: number,
      fileVersion: number,
      currentTime: number,
      upgradeTime: number,
    }>;
    onUpgradeEndResponse(
      args: {
        manufacturerId?: number,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
        currentTime?: number,
        upgradeTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    queryDeviceSpecificFileRequest(
      args: {
        manufacturerId?: number,
        requestNodeAddress?: string,
        manufacturerCode?: number,
        imageType?: number,
        fileVersion?: number,
        zigBeeStackVersion?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status?: types.ZCLEnum8Status,
      manufacturerCode?: number,
      imageType?: number,
      fileVersion?: number,
      imageSize?: number,
    }>;
  }
  type PowerProfileClusterAttributes = Record<never, never>;
  type PowerProfileClusterCommands = Record<never, never>;
  class PowerProfileCluster<Attributes extends types.AttributeDefinitions = PowerProfileClusterAttributes, Commands extends types.CommandDefinitions = PowerProfileClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type PollControlClusterAttributes = {
    checkInInterval: { id: 0x00, type: ZCLDataType<number> },
    longPollInterval: { id: 0x01, type: ZCLDataType<number> },
    shortPollInterval: { id: 0x02, type: ZCLDataType<number> },
    fastPollTimeout: { id: 0x03, type: ZCLDataType<number> },
    checkInIntervalMin: { id: 0x04, type: ZCLDataType<number> },
    longPollIntervalMin: { id: 0x05, type: ZCLDataType<number> },
    fastPollTimeoutMax: { id: 0x06, type: ZCLDataType<number> },
  };
  type PollControlClusterCommands = {
    fastPollStop: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT" },
    setLongPollInterval: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        newLongPollInterval: ZCLDataType<number>,
      },
    },
    setShortPollInterval: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        newShortPollInterval: ZCLDataType<number>,
      },
    },
  };
  class PollControlCluster<Attributes extends types.AttributeDefinitions = PollControlClusterAttributes, Commands extends types.CommandDefinitions = PollControlClusterCommands> extends Cluster<Attributes, Commands> {
    fastPollStop(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    setLongPollInterval(
      args: {
        manufacturerId?: number,
        newLongPollInterval?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    setShortPollInterval(
      args: {
        manufacturerId?: number,
        newShortPollInterval?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type ShadeConfigurationClusterAttributes = Record<never, never>;
  type ShadeConfigurationClusterCommands = Record<never, never>;
  class ShadeConfigurationCluster<Attributes extends types.AttributeDefinitions = ShadeConfigurationClusterAttributes, Commands extends types.CommandDefinitions = ShadeConfigurationClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type DoorLockClusterAttributes = {
    lockState: { id: 0x00, type: ZCLDataType<"notFullyLocked" | "locked" | "unlocked" | "undefined"> },
    lockType: { id: 0x01, type: ZCLDataType<"deadBolt" | "magnetic" | "other" | "mortise" | "rim" | "latchBolt" | "cylindricalLock" | "tubularLock" | "interconnectedLock" | "deadLatch" | "doorFurniture"> },
    actuatorEnabled: { id: 0x02, type: ZCLDataType<boolean> },
    doorState: { id: 0x03, type: ZCLDataType<"open" | "closed" | "errorJammed" | "errorForcedOpen" | "errorUnspecified" | "undefined"> },
    doorOpenEvents: { id: 0x04, type: ZCLDataType<number> },
    doorClosedEvents: { id: 0x05, type: ZCLDataType<number> },
    openPeriod: { id: 0x06, type: ZCLDataType<number> },
    numberOfLogRecordsSupported: { id: 0x10, type: ZCLDataType<number> },
    numberOfTotalUsersSupported: { id: 0x11, type: ZCLDataType<number> },
    numberOfPINUsersSupported: { id: 0x12, type: ZCLDataType<number> },
    numberOfRFIDUsersSupported: { id: 0x13, type: ZCLDataType<number> },
    numberOfWeekDaySchedulesSupportedPerUser: { id: 0x14, type: ZCLDataType<number> },
    numberOfYearDaySchedulesSupportedPerUser: { id: 0x15, type: ZCLDataType<number> },
    numberOfHolidaySchedulesSupported: { id: 0x16, type: ZCLDataType<number> },
    maxPINCodeLength: { id: 0x17, type: ZCLDataType<number> },
    minPINCodeLength: { id: 0x18, type: ZCLDataType<number> },
    maxRFIDCodeLength: { id: 0x19, type: ZCLDataType<number> },
    minRFIDCodeLength: { id: 0x1a, type: ZCLDataType<number> },
    enableLogging: { id: 0x20, type: ZCLDataType<boolean> },
    language: { id: 0x21, type: ZCLDataType<string> },
    ledSettings: { id: 0x22, type: ZCLDataType<number> },
    autoRelockTime: { id: 0x23, type: ZCLDataType<number> },
    soundVolume: { id: 0x24, type: ZCLDataType<number> },
    operatingMode: { id: 0x25, type: ZCLDataType<"normal" | "vacation" | "privacy" | "noRFLockOrUnlock" | "passage"> },
    supportedOperatingModes: { id: 0x26, type: ZCLDataType<Bitmap<"normal" | "vacation" | "privacy" | "noRFLockOrUnlock" | "passage">> },
    defaultConfigurationRegister: { id: 0x27, type: ZCLDataType<Bitmap<"enableLocalProgramming" | "keypadInterfaceDefaultAccess" | "rfInterfaceDefaultAccess" | "reserved3" | "reserved4" | "soundEnabled" | "autoRelockTimeSet" | "ledSettingsSet">> },
    enableLocalProgramming: { id: 0x28, type: ZCLDataType<boolean> },
    enableOneTouchLocking: { id: 0x29, type: ZCLDataType<boolean> },
    enableInsideStatusLED: { id: 0x2a, type: ZCLDataType<boolean> },
    enablePrivacyModeButton: { id: 0x2b, type: ZCLDataType<boolean> },
    wrongCodeEntryLimit: { id: 0x30, type: ZCLDataType<number> },
    userCodeTemporaryDisableTime: { id: 0x31, type: ZCLDataType<number> },
    sendPINOverTheAir: { id: 0x32, type: ZCLDataType<boolean> },
    requirePINforRFOperation: { id: 0x33, type: ZCLDataType<boolean> },
    securityLevel: { id: 0x34, type: ZCLDataType<"network" | "apsSecurity"> },
    alarmMask: { id: 0x40, type: ZCLDataType<Bitmap<"deadboltJammed" | "lockResetToFactoryDefaults" | "reserved2" | "rfModulePowerCycled" | "tamperAlarmWrongCodeEntryLimit" | "tamperAlarmFrontEscutcheonRemoved" | "forcedDoorOpenUnderDoorLockedCondition">> },
    keypadOperationEventMask: { id: 0x41, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificKeypadOperationEvent" | "lockSourceKeypad" | "unlockSourceKeypad" | "lockSourceKeypadErrorInvalidPIN" | "lockSourceKeypadErrorInvalidSchedule" | "unlockSourceKeypadErrorInvalidCode" | "unlockSourceKeypadErrorInvalidSchedule" | "nonAccessUserOperationEventSourceKeypad">> },
    rfOperationEventMask: { id: 0x42, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificKeypadOperationEvent" | "lockSourceRF" | "unlockSourceRF" | "lockSourceRFErrorInvalidCode" | "lockSourceRFErrorInvalidSchedule" | "unlockSourceRFErrorInvalidCode" | "unlockSourceRFErrorInvalidSchedule">> },
    manualOperationEventMask: { id: 0x43, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificManualOperationEvent" | "thumbturnLock" | "thumbturnUnlock" | "oneTouchLock" | "keyLock" | "keyUnlock" | "autoLock" | "scheduleLock" | "scheduleUnlock" | "manualLock" | "manualUnlock">> },
    rfidOperationEventMask: { id: 0x44, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificKeypadOperationEvent" | "lockSourceRFID" | "unlockSourceRFID" | "lockSourceRFIDErrorInvalidRFIDID" | "lockSourceRFIDErrorInvalidSchedule" | "unlockSourceRFIDErrorInvalidRFIDID" | "unlockSourceRFIDErrorInvalidSchedule">> },
    keypadProgrammingEventMask: { id: 0x45, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificKeypadProgrammingEvent" | "masterCodeChanged" | "pinCodeAdded" | "pinCodeDeleted" | "pinCodeChanged">> },
    rfProgrammingEventMask: { id: 0x46, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificRFProgrammingEvent" | "reserved1" | "pinCodeAdded" | "pinCodeDeleted" | "pinCodeChanged" | "rfidCodeAdded" | "rfidCodeDeleted">> },
    rfidProgrammingEventMask: { id: 0x47, type: ZCLDataType<Bitmap<"unknownOrManufacturerSpecificRFIDProgrammingEvent" | "rfidCodeAdded" | "rfidCodeDeleted">> },
  };
  type DoorLockClusterCommands = {
    lockDoor: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        pinCode: ZCLDataType<Buffer>,
      },
    },
    unlockDoor: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        pinCode: ZCLDataType<Buffer>,
      },
    },
    toggle: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        pinCode: ZCLDataType<Buffer>,
      },
    },
    unlockWithTimeout: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        timeout: ZCLDataType<number>,
        pinCode: ZCLDataType<Buffer>,
      },
    },
    getLogRecord: { id: 0x04, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        logIndex: ZCLDataType<number>,
      },
    },
    setPINCode: { id: 0x05, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
        userStatus: ZCLDataType<"available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported">,
        userType: ZCLDataType<"unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported">,
        pinCode: ZCLDataType<Buffer>,
      },
    },
    getPINCode: { id: 0x06, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
      },
    },
    clearPINCode: { id: 0x07, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
      },
    },
    clearAllPINCodes: { id: 0x08, direction: "DIRECTION_SERVER_TO_CLIENT" },
    setUserStatus: { id: 0x09, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
        userStatus: ZCLDataType<"available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported">,
      },
    },
    getUserStatus: { id: 0x0a, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
      },
    },
    setWeekDaySchedule: { id: 0x0b, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        scheduleId: ZCLDataType<number>,
        userId: ZCLDataType<number>,
        daysMask: ZCLDataType<Bitmap<"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday">>,
        startHour: ZCLDataType<number>,
        startMinute: ZCLDataType<number>,
        endHour: ZCLDataType<number>,
        endMinute: ZCLDataType<number>,
      },
    },
    getWeekDaySchedule: { id: 0x0c, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        scheduleId: ZCLDataType<number>,
        userId: ZCLDataType<number>,
      },
    },
    clearWeekDaySchedule: { id: 0x0d, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        scheduleId: ZCLDataType<number>,
        userId: ZCLDataType<number>,
      },
    },
    setYearDaySchedule: { id: 0x0e, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        scheduleId: ZCLDataType<number>,
        userId: ZCLDataType<number>,
        localStartTime: ZCLDataType<number>,
        localEndTime: ZCLDataType<number>,
      },
    },
    getYearDaySchedule: { id: 0x0f, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        scheduleId: ZCLDataType<number>,
        userId: ZCLDataType<number>,
      },
    },
    clearYearDaySchedule: { id: 0x10, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        scheduleId: ZCLDataType<number>,
        userId: ZCLDataType<number>,
      },
    },
    setHolidaySchedule: { id: 0x11, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        holidayScheduleId: ZCLDataType<number>,
        localStartTime: ZCLDataType<number>,
        localEndTime: ZCLDataType<number>,
        operatingModeDuringHoliday: ZCLDataType<"normal" | "vacation" | "privacy" | "noRFLockOrUnlock" | "passage">,
      },
    },
    getHolidaySchedule: { id: 0x12, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        holidayScheduleId: ZCLDataType<number>,
      },
    },
    clearHolidaySchedule: { id: 0x13, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        holidayScheduleId: ZCLDataType<number>,
      },
    },
    setUserType: { id: 0x14, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
        userType: ZCLDataType<"unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported">,
      },
    },
    getUserType: { id: 0x15, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
      },
    },
    setRFIDCode: { id: 0x16, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
        userStatus: ZCLDataType<"available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported">,
        userType: ZCLDataType<"unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported">,
        rfidCode: ZCLDataType<Buffer>,
      },
    },
    getRFIDCode: { id: 0x17, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
      },
    },
    clearRFIDCode: { id: 0x18, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        userId: ZCLDataType<number>,
      },
    },
    clearAllRFIDCodes: { id: 0x19, direction: "DIRECTION_SERVER_TO_CLIENT" },
    operationEventNotification: { id: 0x20, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        operationEventSource: ZCLDataType<number>,
        operationEventCode: ZCLDataType<number>,
        userId: ZCLDataType<number>,
        pin: ZCLDataType<Buffer>,
        zigBeeLocalTime: ZCLDataType<number>,
        data: ZCLDataType<Buffer>,
      },
    },
    programmingEventNotification: { id: 0x21, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        programEventSource: ZCLDataType<number>,
        programEventCode: ZCLDataType<number>,
        userId: ZCLDataType<number>,
        pin: ZCLDataType<Buffer>,
        userType: ZCLDataType<"unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported">,
        userStatus: ZCLDataType<"available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported">,
        zigBeeLocalTime: ZCLDataType<number>,
        data: ZCLDataType<Buffer>,
      },
    },
  };
  class DoorLockCluster<Attributes extends types.AttributeDefinitions = DoorLockClusterAttributes, Commands extends types.CommandDefinitions = DoorLockClusterCommands> extends Cluster<Attributes, Commands> {
    lockDoor(
      args: {
        manufacturerId?: number,
        pinCode?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    unlockDoor(
      args: {
        manufacturerId?: number,
        pinCode?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    toggle(
      args: {
        manufacturerId?: number,
        pinCode?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    unlockWithTimeout(
      args: {
        manufacturerId?: number,
        timeout?: number,
        pinCode?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getLogRecord(
      args: {
        manufacturerId?: number,
        logIndex?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      logEntryId: number,
      timestamp: number,
      eventType: number,
      source: number,
      eventIdOrAlarmCode: number,
      userId: number,
      pin: Buffer,
    }>;
    setPINCode(
      args: {
        manufacturerId?: number,
        userId?: number,
        userStatus?: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
        userType?: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
        pinCode?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getPINCode(
      args: {
        manufacturerId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      userId: number,
      userStatus: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
      userType: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
      pinCode: Buffer,
    }>;
    clearPINCode(
      args: {
        manufacturerId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    clearAllPINCodes(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    setUserStatus(
      args: {
        manufacturerId?: number,
        userId?: number,
        userStatus?: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getUserStatus(
      args: {
        manufacturerId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      userId: number,
      userStatus: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
    }>;
    setWeekDaySchedule(
      args: {
        manufacturerId?: number,
        scheduleId?: number,
        userId?: number,
        daysMask?: Bitmap<"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday">,
        startHour?: number,
        startMinute?: number,
        endHour?: number,
        endMinute?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getWeekDaySchedule(
      args: {
        manufacturerId?: number,
        scheduleId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      scheduleId: number,
      userId: number,
      status: number,
      daysMask: Bitmap<"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday">,
      startHour: number,
      startMinute: number,
      endHour: number,
      endMinute: number,
    }>;
    clearWeekDaySchedule(
      args: {
        manufacturerId?: number,
        scheduleId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    setYearDaySchedule(
      args: {
        manufacturerId?: number,
        scheduleId?: number,
        userId?: number,
        localStartTime?: number,
        localEndTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getYearDaySchedule(
      args: {
        manufacturerId?: number,
        scheduleId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      scheduleId: number,
      userId: number,
      status: number,
      localStartTime: number,
      localEndTime: number,
    }>;
    clearYearDaySchedule(
      args: {
        manufacturerId?: number,
        scheduleId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    setHolidaySchedule(
      args: {
        manufacturerId?: number,
        holidayScheduleId?: number,
        localStartTime?: number,
        localEndTime?: number,
        operatingModeDuringHoliday?: "normal" | "vacation" | "privacy" | "noRFLockOrUnlock" | "passage",
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getHolidaySchedule(
      args: {
        manufacturerId?: number,
        holidayScheduleId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      holidayScheduleId: number,
      status: number,
      localStartTime: number,
      localEndTime: number,
      operatingMode: "normal" | "vacation" | "privacy" | "noRFLockOrUnlock" | "passage",
    }>;
    clearHolidaySchedule(
      args: {
        manufacturerId?: number,
        holidayScheduleId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    setUserType(
      args: {
        manufacturerId?: number,
        userId?: number,
        userType?: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getUserType(
      args: {
        manufacturerId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      userId: number,
      userType: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
    }>;
    setRFIDCode(
      args: {
        manufacturerId?: number,
        userId?: number,
        userStatus?: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
        userType?: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
        rfidCode?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    getRFIDCode(
      args: {
        manufacturerId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      userId: number,
      userStatus: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
      userType: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
      rfidCode: Buffer,
    }>;
    clearRFIDCode(
      args: {
        manufacturerId?: number,
        userId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    clearAllRFIDCodes(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      status: number,
    }>;
    onOperationEventNotification(
      args: {
        manufacturerId?: number,
        operationEventSource?: number,
        operationEventCode?: number,
        userId?: number,
        pin?: Buffer,
        zigBeeLocalTime?: number,
        data?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    onProgrammingEventNotification(
      args: {
        manufacturerId?: number,
        programEventSource?: number,
        programEventCode?: number,
        userId?: number,
        pin?: Buffer,
        userType?: "unrestricted" | "yearDayScheduleUser" | "weekDayScheduleUser" | "masterUser" | "nonAccessUser" | "notSupported",
        userStatus?: "available" | "occupiedEnabled" | "occupiedDisabled" | "notSupported",
        zigBeeLocalTime?: number,
        data?: Buffer,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type WindowCoveringClusterAttributes = {
    windowCoveringType: { id: 0x00, type: ZCLDataType<"rollershade" | "rollershade2Motor" | "rollershadeExterior" | "rollershadeExterior2Motor" | "drapery" | "awning" | "shutter" | "tiltBlindTiltOnly" | "tiltBlindLiftAndTilt" | "projectorScreen"> },
    physicalClosedLimitLift: { id: 0x01, type: ZCLDataType<number> },
    physicalClosedLimitTilt: { id: 0x02, type: ZCLDataType<number> },
    currentPositionLift: { id: 0x03, type: ZCLDataType<number> },
    currentPositionTilt: { id: 0x04, type: ZCLDataType<number> },
    numberofActuationsLift: { id: 0x05, type: ZCLDataType<number> },
    numberofActuationsTilt: { id: 0x06, type: ZCLDataType<number> },
    configStatus: { id: 0x07, type: ZCLDataType<Bitmap<"operational" | "online" | "reversalLiftCommands" | "controlLift" | "controlTilt" | "encoderLift" | "encoderTilt" | "reserved">> },
    currentPositionLiftPercentage: { id: 0x08, type: ZCLDataType<number> },
    currentPositionTiltPercentage: { id: 0x09, type: ZCLDataType<number> },
    installedOpenLimitLift: { id: 0x10, type: ZCLDataType<number> },
    installedClosedLimitLift: { id: 0x11, type: ZCLDataType<number> },
    installedOpenLimitTilt: { id: 0x12, type: ZCLDataType<number> },
    installedClosedLimitTilt: { id: 0x13, type: ZCLDataType<number> },
    velocityLift: { id: 0x14, type: ZCLDataType<number> },
    accelerationTimeLift: { id: 0x15, type: ZCLDataType<number> },
    decelerationTimeLift: { id: 0x16, type: ZCLDataType<number> },
    mode: { id: 0x17, type: ZCLDataType<Bitmap<"motorDirectionReversed" | "calibrationMode" | "maintenanceMode" | "ledFeedback">> },
    intermediateSetpointsLift: { id: 0x18, type: ZCLDataType<Buffer> },
    intermediateSetpointsTilt: { id: 0x19, type: ZCLDataType<Buffer> },
  };
  type WindowCoveringClusterCommands = {
    upOpen: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT" },
    downClose: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT" },
    stop: { id: 0x02, direction: "DIRECTION_SERVER_TO_CLIENT" },
    goToLiftValue: { id: 0x04, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        liftValue: ZCLDataType<number>,
      },
    },
    goToLiftPercentage: { id: 0x05, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        percentageLiftValue: ZCLDataType<number>,
      },
    },
    goToTiltValue: { id: 0x07, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        tiltValue: ZCLDataType<number>,
      },
    },
    goToTiltPercentage: { id: 0x08, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        percentageTiltValue: ZCLDataType<number>,
      },
    },
  };
  class WindowCoveringCluster<Attributes extends types.AttributeDefinitions = WindowCoveringClusterAttributes, Commands extends types.CommandDefinitions = WindowCoveringClusterCommands> extends Cluster<Attributes, Commands> {
    upOpen(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    downClose(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    stop(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    goToLiftValue(
      args: {
        manufacturerId?: number,
        liftValue?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    goToLiftPercentage(
      args: {
        manufacturerId?: number,
        percentageLiftValue?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    goToTiltValue(
      args: {
        manufacturerId?: number,
        tiltValue?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    goToTiltPercentage(
      args: {
        manufacturerId?: number,
        percentageTiltValue?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type ThermostatClusterAttributes = {
    localTemperature: { id: 0x00, type: ZCLDataType<number> },
    outdoorTemperature: { id: 0x01, type: ZCLDataType<number> },
    occupancy: { id: 0x02, type: ZCLDataType<Bitmap<"occupied">> },
    absMinHeatSetpointLimit: { id: 0x03, type: ZCLDataType<number> },
    absMaxHeatSetpointLimit: { id: 0x04, type: ZCLDataType<number> },
    absMinCoolSetpointLimit: { id: 0x05, type: ZCLDataType<number> },
    absMaxCoolSetpointLimit: { id: 0x06, type: ZCLDataType<number> },
    pICoolingDemand: { id: 0x07, type: ZCLDataType<number> },
    pIHeatingDemand: { id: 0x08, type: ZCLDataType<number> },
    localTemperatureCalibration: { id: 0x10, type: ZCLDataType<number> },
    occupiedCoolingSetpoint: { id: 0x11, type: ZCLDataType<number> },
    occupiedHeatingSetpoint: { id: 0x12, type: ZCLDataType<number> },
    unoccupiedCoolingSetpoint: { id: 0x13, type: ZCLDataType<number> },
    unoccupiedHeatingSetpoint: { id: 0x14, type: ZCLDataType<number> },
    minHeatSetpointLimit: { id: 0x15, type: ZCLDataType<number> },
    maxHeatSetpointLimit: { id: 0x16, type: ZCLDataType<number> },
    minCoolSetpointLimit: { id: 0x17, type: ZCLDataType<number> },
    maxCoolSetpointLimit: { id: 0x18, type: ZCLDataType<number> },
    minSetpointDeadBand: { id: 0x19, type: ZCLDataType<number> },
    remoteSensing: { id: 0x1a, type: ZCLDataType<Bitmap<"localTemperature" | "outdoorTemperature" | "occupancy">> },
    controlSequenceOfOperation: { id: 0x1b, type: ZCLDataType<"cooling" | "coolingWithReheat" | "heating" | "heatingWithReheat" | "coolingAndHeating4Pipes" | "coolingAndHeating4PipesWithReheat"> },
    systemMode: { id: 0x1c, type: ZCLDataType<"off" | "auto" | "cool" | "heat" | "emergencyHeating" | "precooling" | "fanOnly" | "dry" | "sleep"> },
    alarmMask: { id: 0x1d, type: ZCLDataType<Bitmap<"initializationFailure" | "hardwareFailure" | "selfCalibrationFailure">> },
  };
  type ThermostatClusterCommands = {
    setSetpoint: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        mode: ZCLDataType<"heat" | "cool" | "both">,
        amount: ZCLDataType<number>,
      },
    },
  };
  class ThermostatCluster<Attributes extends types.AttributeDefinitions = ThermostatClusterAttributes, Commands extends types.CommandDefinitions = ThermostatClusterCommands> extends Cluster<Attributes, Commands> {
    setSetpoint(
      args: {
        manufacturerId?: number,
        mode?: "heat" | "cool" | "both",
        amount?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type PumpConfigurationAndControlClusterAttributes = Record<never, never>;
  type PumpConfigurationAndControlClusterCommands = Record<never, never>;
  class PumpConfigurationAndControlCluster<Attributes extends types.AttributeDefinitions = PumpConfigurationAndControlClusterAttributes, Commands extends types.CommandDefinitions = PumpConfigurationAndControlClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type FanControlClusterAttributes = Record<never, never>;
  type FanControlClusterCommands = Record<never, never>;
  class FanControlCluster<Attributes extends types.AttributeDefinitions = FanControlClusterAttributes, Commands extends types.CommandDefinitions = FanControlClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type DehumidificationControlClusterAttributes = Record<never, never>;
  type DehumidificationControlClusterCommands = Record<never, never>;
  class DehumidificationControlCluster<Attributes extends types.AttributeDefinitions = DehumidificationControlClusterAttributes, Commands extends types.CommandDefinitions = DehumidificationControlClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type ColorControlClusterAttributes = {
    currentHue: { id: 0x00, type: ZCLDataType<number> },
    currentSaturation: { id: 0x01, type: ZCLDataType<number> },
    currentX: { id: 0x03, type: ZCLDataType<number> },
    currentY: { id: 0x04, type: ZCLDataType<number> },
    colorTemperatureMireds: { id: 0x07, type: ZCLDataType<number> },
    colorMode: { id: 0x08, type: ZCLDataType<"currentHueAndCurrentSaturation" | "currentXAndCurrentY" | "colorTemperatureMireds"> },
    colorCapabilities: { id: 0x400a, type: ZCLDataType<Bitmap<"hueAndSaturation" | "enhancedHue" | "colorLoop" | "xy" | "colorTemperature">> },
    colorTempPhysicalMinMireds: { id: 0x400b, type: ZCLDataType<number> },
    colorTempPhysicalMaxMireds: { id: 0x400c, type: ZCLDataType<number> },
  };
  type ColorControlClusterCommands = {
    moveToHue: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        hue: ZCLDataType<number>,
        direction: ZCLDataType<"shortestDistance" | "longestDistance" | "up" | "down">,
        transitionTime: ZCLDataType<number>,
      },
    },
    moveToSaturation: { id: 0x03, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        saturation: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    moveToHueAndSaturation: { id: 0x06, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        hue: ZCLDataType<number>,
        saturation: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    moveToColor: { id: 0x07, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        colorX: ZCLDataType<number>,
        colorY: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
    moveToColorTemperature: { id: 0x0a, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        colorTemperature: ZCLDataType<number>,
        transitionTime: ZCLDataType<number>,
      },
    },
  };
  class ColorControlCluster<Attributes extends types.AttributeDefinitions = ColorControlClusterAttributes, Commands extends types.CommandDefinitions = ColorControlClusterCommands> extends Cluster<Attributes, Commands> {
    moveToHue(
      args: {
        manufacturerId?: number,
        hue?: number,
        direction?: "shortestDistance" | "longestDistance" | "up" | "down",
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    moveToSaturation(
      args: {
        manufacturerId?: number,
        saturation?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    moveToHueAndSaturation(
      args: {
        manufacturerId?: number,
        hue?: number,
        saturation?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    moveToColor(
      args: {
        manufacturerId?: number,
        colorX?: number,
        colorY?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    moveToColorTemperature(
      args: {
        manufacturerId?: number,
        colorTemperature?: number,
        transitionTime?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type BallastConfigurationClusterAttributes = {
    physicalMinLevel: { id: 0x00, type: ZCLDataType<number> },
    physicalMaxLevel: { id: 0x01, type: ZCLDataType<number> },
    ballastStatus: { id: 0x02, type: ZCLDataType<Bitmap<"nonOperational" | "lampNotInSocket">> },
    minLevel: { id: 0x10, type: ZCLDataType<number> },
    maxLevel: { id: 0x11, type: ZCLDataType<number> },
    powerOnLevel: { id: 0x12, type: ZCLDataType<number> },
    powerOnFadeTime: { id: 0x13, type: ZCLDataType<number> },
    intrinsicBallastFactor: { id: 0x14, type: ZCLDataType<number> },
    ballastFactorAdjustment: { id: 0x15, type: ZCLDataType<number> },
    lampQuantity: { id: 0x20, type: ZCLDataType<number> },
    lampType: { id: 0x30, type: ZCLDataType<string> },
    lampManufacturer: { id: 0x31, type: ZCLDataType<string> },
    lampRatedHours: { id: 0x32, type: ZCLDataType<number> },
    lampBurnHours: { id: 0x33, type: ZCLDataType<number> },
    lampAlarmMode: { id: 0x34, type: ZCLDataType<Bitmap<"lampBurnHours">> },
    lampBurnHoursTripPoint: { id: 0x35, type: ZCLDataType<number> },
  };
  type BallastConfigurationClusterCommands = Record<never, never>;
  class BallastConfigurationCluster<Attributes extends types.AttributeDefinitions = BallastConfigurationClusterAttributes, Commands extends types.CommandDefinitions = BallastConfigurationClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type IlluminanceMeasurementClusterAttributes = {
    measuredValue: { id: 0x00, type: ZCLDataType<number> },
    minMeasuredValue: { id: 0x01, type: ZCLDataType<number> },
    maxMeasuredValue: { id: 0x02, type: ZCLDataType<number> },
    tolerance: { id: 0x03, type: ZCLDataType<number> },
    lightSensorType: { id: 0x04, type: ZCLDataType<"photodiode" | "cmos" | "unknown"> },
  };
  type IlluminanceMeasurementClusterCommands = Record<never, never>;
  class IlluminanceMeasurementCluster<Attributes extends types.AttributeDefinitions = IlluminanceMeasurementClusterAttributes, Commands extends types.CommandDefinitions = IlluminanceMeasurementClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type IlluminanceLevelSensingClusterAttributes = {
    levelStatus: { id: 0x00, type: ZCLDataType<"illuminanceOnTarget" | "illuminanceBelowTarget" | "illuminanceAboveTarget"> },
    lightSensorType: { id: 0x01, type: ZCLDataType<"photodiode" | "cmos" | "unknown"> },
    illuminanceTargetLevel: { id: 0x10, type: ZCLDataType<number> },
  };
  type IlluminanceLevelSensingClusterCommands = Record<never, never>;
  class IlluminanceLevelSensingCluster<Attributes extends types.AttributeDefinitions = IlluminanceLevelSensingClusterAttributes, Commands extends types.CommandDefinitions = IlluminanceLevelSensingClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type TemperatureMeasurementClusterAttributes = {
    measuredValue: { id: 0x00, type: ZCLDataType<number> },
    minMeasuredValue: { id: 0x01, type: ZCLDataType<number> },
    maxMeasuredValue: { id: 0x02, type: ZCLDataType<number> },
  };
  type TemperatureMeasurementClusterCommands = Record<never, never>;
  class TemperatureMeasurementCluster<Attributes extends types.AttributeDefinitions = TemperatureMeasurementClusterAttributes, Commands extends types.CommandDefinitions = TemperatureMeasurementClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type PressureMeasurementClusterAttributes = {
    measuredValue: { id: 0x00, type: ZCLDataType<number> },
    minMeasuredValue: { id: 0x01, type: ZCLDataType<number> },
    maxMeasuredValue: { id: 0x02, type: ZCLDataType<number> },
    tolerance: { id: 0x03, type: ZCLDataType<number> },
    scaledValue: { id: 0x10, type: ZCLDataType<number> },
    minScaledValue: { id: 0x11, type: ZCLDataType<number> },
    maxScaledValue: { id: 0x12, type: ZCLDataType<number> },
    scaledTolerance: { id: 0x13, type: ZCLDataType<number> },
    scale: { id: 0x14, type: ZCLDataType<number> },
  };
  type PressureMeasurementClusterCommands = Record<never, never>;
  class PressureMeasurementCluster<Attributes extends types.AttributeDefinitions = PressureMeasurementClusterAttributes, Commands extends types.CommandDefinitions = PressureMeasurementClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type FlowMeasurementClusterAttributes = {
    measuredValue: { id: 0x00, type: ZCLDataType<number> },
    minMeasuredValue: { id: 0x01, type: ZCLDataType<number> },
    maxMeasuredValue: { id: 0x02, type: ZCLDataType<number> },
    tolerance: { id: 0x03, type: ZCLDataType<number> },
  };
  type FlowMeasurementClusterCommands = Record<never, never>;
  class FlowMeasurementCluster<Attributes extends types.AttributeDefinitions = FlowMeasurementClusterAttributes, Commands extends types.CommandDefinitions = FlowMeasurementClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type RelativeHumidityClusterAttributes = {
    measuredValue: { id: 0x00, type: ZCLDataType<number> },
    minMeasuredValue: { id: 0x01, type: ZCLDataType<number> },
    maxMeasuredValue: { id: 0x02, type: ZCLDataType<number> },
    tolerance: { id: 0x03, type: ZCLDataType<number> },
  };
  type RelativeHumidityClusterCommands = Record<never, never>;
  class RelativeHumidityCluster<Attributes extends types.AttributeDefinitions = RelativeHumidityClusterAttributes, Commands extends types.CommandDefinitions = RelativeHumidityClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type OccupancySensingClusterAttributes = {
    occupancy: { id: 0x00, type: ZCLDataType<Bitmap<"occupied">> },
    occupancySensorType: { id: 0x01, type: ZCLDataType<"pir" | "ultrasonic" | "pirAndUltrasonic" | "physicalContact"> },
    occupancySensorTypeBitmap: { id: 0x02, type: ZCLDataType<Bitmap<"pir" | "ultrasonic" | "physicalContact">> },
    pirOccupiedToUnoccupiedDelay: { id: 0x10, type: ZCLDataType<number> },
    pirUnoccupiedToOccupiedDelay: { id: 0x11, type: ZCLDataType<number> },
    pirUnoccupiedToOccupiedThreshold: { id: 0x12, type: ZCLDataType<number> },
    ultrasonicOccupiedToUnoccupiedDelay: { id: 0x20, type: ZCLDataType<number> },
    ultrasonicUnoccupiedToOccupiedDelay: { id: 0x21, type: ZCLDataType<number> },
    ultrasonicUnoccupiedToOccupiedThreshold: { id: 0x22, type: ZCLDataType<number> },
    physicalContactOccupiedToUnoccupiedDelay: { id: 0x30, type: ZCLDataType<number> },
    physicalContactUnoccupiedToOccupiedDelay: { id: 0x31, type: ZCLDataType<number> },
    physicalContactUnoccupiedToOccupiedThreshold: { id: 0x32, type: ZCLDataType<number> },
  };
  type OccupancySensingClusterCommands = Record<never, never>;
  class OccupancySensingCluster<Attributes extends types.AttributeDefinitions = OccupancySensingClusterAttributes, Commands extends types.CommandDefinitions = OccupancySensingClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type IASZoneClusterAttributes = {
    zoneState: { id: 0x00, type: ZCLDataType<"notEnrolled" | "enrolled"> },
    zoneType: { id: 0x01, type: ZCLDataType<"standardCIE" | "motionSensor" | "contactSwitch" | "doorWindowHandle" | "fireSensor" | "waterSensor" | "carbonMonoxideSensor" | "personalEmergencyDevice" | "vibrationMovementSensor" | "remoteControl" | "keyFob" | "keypad" | "standardWarningDevice" | "glassBreakSensor" | "securityRepeater" | "invalidZoneType"> },
    zoneStatus: { id: 0x02, type: ZCLDataType<Bitmap<"alarm1" | "alarm2" | "tamper" | "battery" | "supervisionReports" | "restoreReports" | "trouble" | "acMains" | "test" | "batteryDefect">> },
    iasCIEAddress: { id: 0x10, type: ZCLDataType<string> },
    zoneId: { id: 0x11, type: ZCLDataType<number> },
  };
  type IASZoneClusterCommands = {
    zoneStatusChangeNotification: { id: 0x00, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        zoneStatus: ZCLDataType<Bitmap<"alarm1" | "alarm2" | "tamper" | "battery" | "supervisionReports" | "restoreReports" | "trouble" | "acMains" | "test" | "batteryDefect">>,
        extendedStatus: ZCLDataType<number>,
        zoneId: ZCLDataType<number>,
        delay: ZCLDataType<number>,
      },
    },
    zoneEnrollResponse: { id: 0x00, direction: "DIRECTION_CLIENT_TO_SERVER", args: {
        enrollResponseCode: ZCLDataType<"success" | "notSupported" | "noEnrollPermit" | "tooManyZones">,
        zoneId: ZCLDataType<number>,
      },
    },
    zoneEnrollRequest: { id: 0x01, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        zoneType: ZCLDataType<"standardCIE" | "motionSensor" | "contactSwitch" | "doorWindowHandle" | "fireSensor" | "waterSensor" | "carbonMonoxideSensor" | "personalEmergencyDevice" | "vibrationMovementSensor" | "remoteControl" | "keyFob" | "keypad" | "standardWarningDevice" | "glassBreakSensor" | "securityRepeater" | "invalidZoneType">,
        manufacturerCode: ZCLDataType<number>,
      },
    },
    initiateNormalOperationMode: { id: 0x01, direction: "DIRECTION_CLIENT_TO_SERVER" },
  };
  class IASZoneCluster<Attributes extends types.AttributeDefinitions = IASZoneClusterAttributes, Commands extends types.CommandDefinitions = IASZoneClusterCommands> extends Cluster<Attributes, Commands> {
    onZoneStatusChangeNotification(
      args: {
        manufacturerId?: number,
        zoneStatus?: Bitmap<"alarm1" | "alarm2" | "tamper" | "battery" | "supervisionReports" | "restoreReports" | "trouble" | "acMains" | "test" | "batteryDefect">,
        extendedStatus?: number,
        zoneId?: number,
        delay?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    zoneEnrollResponse(
      args: {
        manufacturerId?: number,
        enrollResponseCode?: "success" | "notSupported" | "noEnrollPermit" | "tooManyZones",
        zoneId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    onZoneEnrollRequest(
      args: {
        manufacturerId?: number,
        zoneType?: "standardCIE" | "motionSensor" | "contactSwitch" | "doorWindowHandle" | "fireSensor" | "waterSensor" | "carbonMonoxideSensor" | "personalEmergencyDevice" | "vibrationMovementSensor" | "remoteControl" | "keyFob" | "keypad" | "standardWarningDevice" | "glassBreakSensor" | "securityRepeater" | "invalidZoneType",
        manufacturerCode?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
    initiateNormalOperationMode(
      args?: {
        manufacturerId?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<void>;
  }
  type IASACEClusterAttributes = Record<never, never>;
  type IASACEClusterCommands = Record<never, never>;
  class IASACECluster<Attributes extends types.AttributeDefinitions = IASACEClusterAttributes, Commands extends types.CommandDefinitions = IASACEClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type IASWDClusterAttributes = Record<never, never>;
  type IASWDClusterCommands = Record<never, never>;
  class IASWDCluster<Attributes extends types.AttributeDefinitions = IASWDClusterAttributes, Commands extends types.CommandDefinitions = IASWDClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type MeteringClusterAttributes = {
    currentSummationDelivered: { id: 0x00, type: ZCLDataType<number> },
    currentSummationReceived: { id: 0x01, type: ZCLDataType<number> },
    currentMaxDemandDelivered: { id: 0x02, type: ZCLDataType<number> },
    currentMaxDemandReceived: { id: 0x03, type: ZCLDataType<number> },
    dftSummation: { id: 0x04, type: ZCLDataType<number> },
    dailyFreezeTime: { id: 0x05, type: ZCLDataType<number> },
    powerFactor: { id: 0x06, type: ZCLDataType<number> },
    readingSnapShotTime: { id: 0x07, type: ZCLDataType<number> },
    currentMaxDemandDeliveredTime: { id: 0x08, type: ZCLDataType<number> },
    currentMaxDemandReceivedTime: { id: 0x09, type: ZCLDataType<number> },
    defaultUpdatePeriod: { id: 0x0a, type: ZCLDataType<number> },
    fastPollUpdatePeriod: { id: 0x0b, type: ZCLDataType<number> },
    currentBlockPeriodConsumptionDelivered: { id: 0x0c, type: ZCLDataType<number> },
    dailyConsumptionTarget: { id: 0x0d, type: ZCLDataType<number> },
    currentBlock: { id: 0x0e, type: ZCLDataType<unknown> },
    profileIntervalPeriod: { id: 0x0f, type: ZCLDataType<unknown> },
    currentTier1SummationDelivered: { id: 0x100, type: ZCLDataType<number> },
    currentTier1SummationReceived: { id: 0x101, type: ZCLDataType<number> },
    currentTier2SummationDelivered: { id: 0x102, type: ZCLDataType<number> },
    currentTier2SummationReceived: { id: 0x103, type: ZCLDataType<number> },
    currentTier3SummationDelivered: { id: 0x104, type: ZCLDataType<number> },
    currentTier3SummationReceived: { id: 0x105, type: ZCLDataType<number> },
    currentTier4SummationDelivered: { id: 0x106, type: ZCLDataType<number> },
    currentTier4SummationReceived: { id: 0x107, type: ZCLDataType<number> },
    status: { id: 0x200, type: ZCLDataType<Bitmap<"checkMeter" | "lowBattery" | "tamperDetect" | "powerFailure" | "powerQuality" | "leakDetect" | "serviceDisconnect">> },
    remainingBatteryLife: { id: 0x201, type: ZCLDataType<number> },
    hoursInOperation: { id: 0x202, type: ZCLDataType<number> },
    hoursInFault: { id: 0x203, type: ZCLDataType<number> },
    unitOfMeasure: { id: 0x300, type: ZCLDataType<unknown> },
    multiplier: { id: 0x301, type: ZCLDataType<number> },
    divisor: { id: 0x302, type: ZCLDataType<number> },
    siteId: { id: 0x307, type: ZCLDataType<Buffer> },
    meterSerialNumber: { id: 0x308, type: ZCLDataType<Buffer> },
    energyCarrierUnitOfMeasure: { id: 0x309, type: ZCLDataType<unknown> },
    temperatureUnitOfMeasure: { id: 0x30c, type: ZCLDataType<unknown> },
    moduleSerialNumber: { id: 0x30e, type: ZCLDataType<Buffer> },
    operatingTariffLabelDelivered: { id: 0x30f, type: ZCLDataType<Buffer> },
    operatingTariffLabelReceived: { id: 0x310, type: ZCLDataType<Buffer> },
    customerIdNumber: { id: 0x311, type: ZCLDataType<Buffer> },
    alternativeUnitOfMeasure: { id: 0x312, type: ZCLDataType<unknown> },
    instantaneousDemand: { id: 0x400, type: ZCLDataType<number> },
    currentDayConsumptionDelivered: { id: 0x401, type: ZCLDataType<number> },
    currentDayConsumptionReceived: { id: 0x402, type: ZCLDataType<number> },
    previousDayConsumptionDelivered: { id: 0x403, type: ZCLDataType<number> },
    previousDayConsumptionReceived: { id: 0x404, type: ZCLDataType<number> },
    currentPartialProfileIntervalStartTimeDelivered: { id: 0x405, type: ZCLDataType<number> },
    currentPartialProfileIntervalStartTimeReceived: { id: 0x406, type: ZCLDataType<number> },
    currentPartialProfileIntervalValueDelivered: { id: 0x407, type: ZCLDataType<number> },
    currentPartialProfileIntervalValueReceived: { id: 0x408, type: ZCLDataType<number> },
    currentDayMaxPressure: { id: 0x409, type: ZCLDataType<number> },
    currentDayMinPressure: { id: 0x40a, type: ZCLDataType<number> },
    previousDayMaxPressure: { id: 0x40b, type: ZCLDataType<number> },
    previousDayMinPressure: { id: 0x40c, type: ZCLDataType<number> },
    currentDayMaxDemand: { id: 0x40d, type: ZCLDataType<number> },
    previousDayMaxDemand: { id: 0x40e, type: ZCLDataType<number> },
    currentMonthMaxDemand: { id: 0x40f, type: ZCLDataType<number> },
    currentYearMaxDemand: { id: 0x410, type: ZCLDataType<number> },
    currentDayMaxEnergyCarrierDemand: { id: 0x411, type: ZCLDataType<number> },
    previousDayMaxEnergyCarrierDemand: { id: 0x412, type: ZCLDataType<number> },
    currentMonthMaxEnergyCarrierDemand: { id: 0x413, type: ZCLDataType<number> },
    currentMonthMinEnergyCarrierDemand: { id: 0x414, type: ZCLDataType<number> },
    currentYearMaxEnergyCarrierDemand: { id: 0x415, type: ZCLDataType<number> },
    currentYearMinEnergyCarrierDemand: { id: 0x416, type: ZCLDataType<number> },
    maxNumberOfPeriodsDelivered: { id: 0x500, type: ZCLDataType<number> },
    currentDemandDelivered: { id: 0x600, type: ZCLDataType<number> },
    demandLimit: { id: 0x601, type: ZCLDataType<number> },
    demandIntegrationPeriod: { id: 0x602, type: ZCLDataType<number> },
    numberOfDemandSubintervals: { id: 0x603, type: ZCLDataType<number> },
    demandLimitArmDuration: { id: 0x604, type: ZCLDataType<number> },
    currentNoTierBlock1SummationDelivered: { id: 0x700, type: ZCLDataType<number> },
    currentNoTierBlock2SummationDelivered: { id: 0x701, type: ZCLDataType<number> },
    currentNoTierBlock3SummationDelivered: { id: 0x702, type: ZCLDataType<number> },
    currentNoTierBlock4SummationDelivered: { id: 0x703, type: ZCLDataType<number> },
    currentNoTierBlock5SummationDelivered: { id: 0x704, type: ZCLDataType<number> },
    currentNoTierBlock6SummationDelivered: { id: 0x705, type: ZCLDataType<number> },
    currentNoTierBlock7SummationDelivered: { id: 0x706, type: ZCLDataType<number> },
    currentNoTierBlock8SummationDelivered: { id: 0x707, type: ZCLDataType<number> },
    currentNoTierBlock9SummationDelivered: { id: 0x708, type: ZCLDataType<number> },
    currentNoTierBlock10SummationDelivered: { id: 0x709, type: ZCLDataType<number> },
    currentNoTierBlock11SummationDelivered: { id: 0x70a, type: ZCLDataType<number> },
    currentNoTierBlock12SummationDelivered: { id: 0x70b, type: ZCLDataType<number> },
    currentNoTierBlock13SummationDelivered: { id: 0x70c, type: ZCLDataType<number> },
    currentNoTierBlock14SummationDelivered: { id: 0x70d, type: ZCLDataType<number> },
    currentNoTierBlock15SummationDelivered: { id: 0x70e, type: ZCLDataType<number> },
    currentNoTierBlock16SummationDelivered: { id: 0x70f, type: ZCLDataType<number> },
    currentTier1Block1SummationDelivered: { id: 0x710, type: ZCLDataType<number> },
    currentTier1Block2SummationDelivered: { id: 0x711, type: ZCLDataType<number> },
    currentTier1Block3SummationDelivered: { id: 0x712, type: ZCLDataType<number> },
    currentTier1Block4SummationDelivered: { id: 0x713, type: ZCLDataType<number> },
    currentTier1Block5SummationDelivered: { id: 0x714, type: ZCLDataType<number> },
    currentTier1Block6SummationDelivered: { id: 0x715, type: ZCLDataType<number> },
    currentTier1Block7SummationDelivered: { id: 0x716, type: ZCLDataType<number> },
    currentTier1Block8SummationDelivered: { id: 0x717, type: ZCLDataType<number> },
    currentTier1Block9SummationDelivered: { id: 0x718, type: ZCLDataType<number> },
    currentTier1Block10SummationDelivered: { id: 0x719, type: ZCLDataType<number> },
    currentTier1Block11SummationDelivered: { id: 0x71a, type: ZCLDataType<number> },
    currentTier1Block12SummationDelivered: { id: 0x71b, type: ZCLDataType<number> },
    currentTier1Block13SummationDelivered: { id: 0x71c, type: ZCLDataType<number> },
    currentTier1Block14SummationDelivered: { id: 0x71d, type: ZCLDataType<number> },
    currentTier1Block15SummationDelivered: { id: 0x71e, type: ZCLDataType<number> },
    currentTier1Block16SummationDelivered: { id: 0x71f, type: ZCLDataType<number> },
    currentTier2Block1SummationDelivered: { id: 0x720, type: ZCLDataType<number> },
    currentTier2Block2SummationDelivered: { id: 0x721, type: ZCLDataType<number> },
    currentTier2Block3SummationDelivered: { id: 0x722, type: ZCLDataType<number> },
    currentTier2Block4SummationDelivered: { id: 0x723, type: ZCLDataType<number> },
    currentTier2Block5SummationDelivered: { id: 0x724, type: ZCLDataType<number> },
    currentTier2Block6SummationDelivered: { id: 0x725, type: ZCLDataType<number> },
    currentTier2Block7SummationDelivered: { id: 0x726, type: ZCLDataType<number> },
    currentTier2Block8SummationDelivered: { id: 0x727, type: ZCLDataType<number> },
    currentTier2Block9SummationDelivered: { id: 0x728, type: ZCLDataType<number> },
    currentTier2Block10SummationDelivered: { id: 0x729, type: ZCLDataType<number> },
    currentTier2Block11SummationDelivered: { id: 0x72a, type: ZCLDataType<number> },
    currentTier2Block12SummationDelivered: { id: 0x72b, type: ZCLDataType<number> },
    currentTier2Block13SummationDelivered: { id: 0x72c, type: ZCLDataType<number> },
    currentTier2Block14SummationDelivered: { id: 0x72d, type: ZCLDataType<number> },
    currentTier2Block15SummationDelivered: { id: 0x72e, type: ZCLDataType<number> },
    currentTier2Block16SummationDelivered: { id: 0x72f, type: ZCLDataType<number> },
    currentTier3Block1SummationDelivered: { id: 0x730, type: ZCLDataType<number> },
    currentTier3Block2SummationDelivered: { id: 0x731, type: ZCLDataType<number> },
    currentTier3Block3SummationDelivered: { id: 0x732, type: ZCLDataType<number> },
    currentTier3Block4SummationDelivered: { id: 0x733, type: ZCLDataType<number> },
    currentTier3Block5SummationDelivered: { id: 0x734, type: ZCLDataType<number> },
    currentTier3Block6SummationDelivered: { id: 0x735, type: ZCLDataType<number> },
    currentTier3Block7SummationDelivered: { id: 0x736, type: ZCLDataType<number> },
    currentTier3Block8SummationDelivered: { id: 0x737, type: ZCLDataType<number> },
    currentTier3Block9SummationDelivered: { id: 0x738, type: ZCLDataType<number> },
    currentTier3Block10SummationDelivered: { id: 0x739, type: ZCLDataType<number> },
    currentTier3Block11SummationDelivered: { id: 0x73a, type: ZCLDataType<number> },
    currentTier3Block12SummationDelivered: { id: 0x73b, type: ZCLDataType<number> },
    currentTier3Block13SummationDelivered: { id: 0x73c, type: ZCLDataType<number> },
    currentTier3Block14SummationDelivered: { id: 0x73d, type: ZCLDataType<number> },
    currentTier3Block15SummationDelivered: { id: 0x73e, type: ZCLDataType<number> },
    currentTier3Block16SummationDelivered: { id: 0x73f, type: ZCLDataType<number> },
    currentTier4Block1SummationDelivered: { id: 0x740, type: ZCLDataType<number> },
    currentTier4Block2SummationDelivered: { id: 0x741, type: ZCLDataType<number> },
    currentTier4Block3SummationDelivered: { id: 0x742, type: ZCLDataType<number> },
    currentTier4Block4SummationDelivered: { id: 0x743, type: ZCLDataType<number> },
    currentTier4Block5SummationDelivered: { id: 0x744, type: ZCLDataType<number> },
    currentTier4Block6SummationDelivered: { id: 0x745, type: ZCLDataType<number> },
    currentTier4Block7SummationDelivered: { id: 0x746, type: ZCLDataType<number> },
    currentTier4Block8SummationDelivered: { id: 0x747, type: ZCLDataType<number> },
    currentTier4Block9SummationDelivered: { id: 0x748, type: ZCLDataType<number> },
    currentTier4Block10SummationDelivered: { id: 0x749, type: ZCLDataType<number> },
    currentTier4Block11SummationDelivered: { id: 0x74a, type: ZCLDataType<number> },
    currentTier4Block12SummationDelivered: { id: 0x74b, type: ZCLDataType<number> },
    currentTier4Block13SummationDelivered: { id: 0x74c, type: ZCLDataType<number> },
    currentTier4Block14SummationDelivered: { id: 0x74d, type: ZCLDataType<number> },
    currentTier4Block15SummationDelivered: { id: 0x74e, type: ZCLDataType<number> },
    currentTier4Block16SummationDelivered: { id: 0x74f, type: ZCLDataType<number> },
    currentNoTierBlock1SummationReceived: { id: 0x900, type: ZCLDataType<number> },
    currentNoTierBlock2SummationReceived: { id: 0x901, type: ZCLDataType<number> },
    currentNoTierBlock3SummationReceived: { id: 0x902, type: ZCLDataType<number> },
    currentNoTierBlock4SummationReceived: { id: 0x903, type: ZCLDataType<number> },
    currentNoTierBlock5SummationReceived: { id: 0x904, type: ZCLDataType<number> },
    currentNoTierBlock6SummationReceived: { id: 0x905, type: ZCLDataType<number> },
    currentNoTierBlock7SummationReceived: { id: 0x906, type: ZCLDataType<number> },
    currentNoTierBlock8SummationReceived: { id: 0x907, type: ZCLDataType<number> },
    currentNoTierBlock9SummationReceived: { id: 0x908, type: ZCLDataType<number> },
    currentNoTierBlock10SummationReceived: { id: 0x909, type: ZCLDataType<number> },
    currentNoTierBlock11SummationReceived: { id: 0x90a, type: ZCLDataType<number> },
    currentNoTierBlock12SummationReceived: { id: 0x90b, type: ZCLDataType<number> },
    currentNoTierBlock13SummationReceived: { id: 0x90c, type: ZCLDataType<number> },
    currentNoTierBlock14SummationReceived: { id: 0x90d, type: ZCLDataType<number> },
    currentNoTierBlock15SummationReceived: { id: 0x90e, type: ZCLDataType<number> },
    currentNoTierBlock16SummationReceived: { id: 0x90f, type: ZCLDataType<number> },
    billToDateDelivered: { id: 0xa00, type: ZCLDataType<number> },
    billToDateTimeStampDelivered: { id: 0xa01, type: ZCLDataType<number> },
    projectedBillDelivered: { id: 0xa02, type: ZCLDataType<number> },
    projectedBillTimeStampDelivered: { id: 0xa03, type: ZCLDataType<number> },
    billToDateReceived: { id: 0xa10, type: ZCLDataType<number> },
    billToDateTimeStampReceived: { id: 0xa11, type: ZCLDataType<number> },
    projectedBillReceived: { id: 0xa12, type: ZCLDataType<number> },
    projectedBillTimeStampReceived: { id: 0xa13, type: ZCLDataType<number> },
    proposedChangeSupplyImplementationTime: { id: 0xb00, type: ZCLDataType<number> },
    proposedChangeSupplyStatus: { id: 0xb01, type: ZCLDataType<unknown> },
    uncontrolledFlowThreshold: { id: 0xb10, type: ZCLDataType<number> },
    uncontrolledFlowThresholdUnitOfMeasure: { id: 0xb11, type: ZCLDataType<unknown> },
    uncontrolledFlowMultiplier: { id: 0xb12, type: ZCLDataType<number> },
    uncontrolledFlowDivisor: { id: 0xb13, type: ZCLDataType<number> },
    flowStabilisationPeriod: { id: 0xb14, type: ZCLDataType<number> },
    flowMeasurementPeriod: { id: 0xb15, type: ZCLDataType<number> },
  };
  type MeteringClusterCommands = Record<never, never>;
  class MeteringCluster<Attributes extends types.AttributeDefinitions = MeteringClusterAttributes, Commands extends types.CommandDefinitions = MeteringClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type ElectricalMeasurementClusterAttributes = {
    measurementType: { id: 0x00, type: ZCLDataType<Bitmap<"activeMeasurementAC" | "reactiveMeasurementAC" | "apparentMeasurementAC" | "phaseAMeasurement" | "phaseBMeasurement" | "phaseCMeasurement" | "dcMeasurement" | "harmonicsMeasurement" | "powerQualityMeasurement">> },
    acFrequency: { id: 0x300, type: ZCLDataType<number> },
    measuredPhase1stHarmonicCurrent: { id: 0x30d, type: ZCLDataType<number> },
    acFrequencyMultiplier: { id: 0x400, type: ZCLDataType<number> },
    acFrequencyDivisor: { id: 0x401, type: ZCLDataType<number> },
    phaseHarmonicCurrentMultiplier: { id: 0x405, type: ZCLDataType<number> },
    rmsVoltage: { id: 0x505, type: ZCLDataType<number> },
    rmsCurrent: { id: 0x508, type: ZCLDataType<number> },
    activePower: { id: 0x50b, type: ZCLDataType<number> },
    reactivePower: { id: 0x50e, type: ZCLDataType<number> },
    acVoltageMultiplier: { id: 0x600, type: ZCLDataType<number> },
    acVoltageDivisor: { id: 0x601, type: ZCLDataType<number> },
    acCurrentMultiplier: { id: 0x602, type: ZCLDataType<number> },
    acCurrentDivisor: { id: 0x603, type: ZCLDataType<number> },
    acPowerMultiplier: { id: 0x604, type: ZCLDataType<number> },
    acPowerDivisor: { id: 0x605, type: ZCLDataType<number> },
    acAlarmsMask: { id: 0x800, type: ZCLDataType<Bitmap<"voltageOverload" | "currentOverload" | "activePowerOverload" | "reactivePowerOverload" | "averageRMSOverVoltage" | "averageRMSUnderVoltage" | "rmsExtremeOverVoltage" | "rmsExtremeUnderVoltage" | "rmsVoltageSag" | "rmsVoltageSwell">> },
    acVoltageOverload: { id: 0x801, type: ZCLDataType<number> },
    acCurrentOverload: { id: 0x802, type: ZCLDataType<number> },
    acActivePowerOverload: { id: 0x803, type: ZCLDataType<number> },
  };
  type ElectricalMeasurementClusterCommands = Record<never, never>;
  class ElectricalMeasurementCluster<Attributes extends types.AttributeDefinitions = ElectricalMeasurementClusterAttributes, Commands extends types.CommandDefinitions = ElectricalMeasurementClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type DiagnosticsClusterAttributes = Record<never, never>;
  type DiagnosticsClusterCommands = Record<never, never>;
  class DiagnosticsCluster<Attributes extends types.AttributeDefinitions = DiagnosticsClusterAttributes, Commands extends types.CommandDefinitions = DiagnosticsClusterCommands> extends Cluster<Attributes, Commands> {
  }
  type TouchLinkClusterAttributes = Record<never, never>;
  type TouchLinkClusterCommands = {
    getGroups: { id: 0x41, direction: "DIRECTION_SERVER_TO_CLIENT", args: {
        startIdx: ZCLDataType<number>,
      },
    },
  };
  class TouchLinkCluster<Attributes extends types.AttributeDefinitions = TouchLinkClusterAttributes, Commands extends types.CommandDefinitions = TouchLinkClusterCommands> extends Cluster<Attributes, Commands> {
    getGroups(
      args: {
        manufacturerId?: number,
        startIdx?: number,
      },
      opts?: {
        waitForResponse?: boolean,
        timeout?: number,
        disableDefaultResponse?: boolean,
      },
    ): Promise<{
      total: number,
      startIndex: number,
      groups: Array<unknown>,
    }>;
  }
  const CLUSTER: {
    BASIC: {
      ID: 0x0000,
      NAME: "basic",
      ATTRIBUTES: Readonly<BasicClusterAttributes>,
      COMMANDS: Readonly<BasicClusterCommands>,
    },
    POWER_CONFIGURATION: {
      ID: 0x0001,
      NAME: "powerConfiguration",
      ATTRIBUTES: Readonly<PowerConfigurationClusterAttributes>,
      COMMANDS: Readonly<PowerConfigurationClusterCommands>,
    },
    DEVICE_TEMPERATURE: {
      ID: 0x0002,
      NAME: "deviceTemperature",
      ATTRIBUTES: Readonly<DeviceTemperatureClusterAttributes>,
      COMMANDS: Readonly<DeviceTemperatureClusterCommands>,
    },
    IDENTIFY: {
      ID: 0x0003,
      NAME: "identify",
      ATTRIBUTES: Readonly<IdentifyClusterAttributes>,
      COMMANDS: Readonly<IdentifyClusterCommands>,
    },
    GROUPS: {
      ID: 0x0004,
      NAME: "groups",
      ATTRIBUTES: Readonly<GroupsClusterAttributes>,
      COMMANDS: Readonly<GroupsClusterCommands>,
    },
    SCENES: {
      ID: 0x0005,
      NAME: "scenes",
      ATTRIBUTES: Readonly<ScenesClusterAttributes>,
      COMMANDS: Readonly<ScenesClusterCommands>,
    },
    ON_OFF: {
      ID: 0x0006,
      NAME: "onOff",
      ATTRIBUTES: Readonly<OnOffClusterAttributes>,
      COMMANDS: Readonly<OnOffClusterCommands>,
    },
    ON_OFF_SWITCH: {
      ID: 0x0007,
      NAME: "onOffSwitch",
      ATTRIBUTES: Readonly<OnOffSwitchClusterAttributes>,
      COMMANDS: Readonly<OnOffSwitchClusterCommands>,
    },
    LEVEL_CONTROL: {
      ID: 0x0008,
      NAME: "levelControl",
      ATTRIBUTES: Readonly<LevelControlClusterAttributes>,
      COMMANDS: Readonly<LevelControlClusterCommands>,
    },
    ALARMS: {
      ID: 0x0009,
      NAME: "alarms",
      ATTRIBUTES: Readonly<AlarmsClusterAttributes>,
      COMMANDS: Readonly<AlarmsClusterCommands>,
    },
    TIME: {
      ID: 0x000a,
      NAME: "time",
      ATTRIBUTES: Readonly<TimeClusterAttributes>,
      COMMANDS: Readonly<TimeClusterCommands>,
    },
    ANALOG_INPUT: {
      ID: 0x000c,
      NAME: "analogInput",
      ATTRIBUTES: Readonly<AnalogInputClusterAttributes>,
      COMMANDS: Readonly<AnalogInputClusterCommands>,
    },
    ANALOG_OUTPUT: {
      ID: 0x000d,
      NAME: "analogOutput",
      ATTRIBUTES: Readonly<AnalogOutputClusterAttributes>,
      COMMANDS: Readonly<AnalogOutputClusterCommands>,
    },
    ANALOG_VALUE: {
      ID: 0x000e,
      NAME: "analogValue",
      ATTRIBUTES: Readonly<AnalogValueClusterAttributes>,
      COMMANDS: Readonly<AnalogValueClusterCommands>,
    },
    BINARY_INPUT: {
      ID: 0x000f,
      NAME: "binaryInput",
      ATTRIBUTES: Readonly<BinaryInputClusterAttributes>,
      COMMANDS: Readonly<BinaryInputClusterCommands>,
    },
    BINARY_OUTPUT: {
      ID: 0x0010,
      NAME: "binaryOutput",
      ATTRIBUTES: Readonly<BinaryOutputClusterAttributes>,
      COMMANDS: Readonly<BinaryOutputClusterCommands>,
    },
    BINARY_VALUE: {
      ID: 0x0011,
      NAME: "binaryValue",
      ATTRIBUTES: Readonly<BinaryValueClusterAttributes>,
      COMMANDS: Readonly<BinaryValueClusterCommands>,
    },
    MULTI_STATE_INPUT: {
      ID: 0x0012,
      NAME: "multistateInput",
      ATTRIBUTES: Readonly<MultistateInputClusterAttributes>,
      COMMANDS: Readonly<MultistateInputClusterCommands>,
    },
    MULTI_STATE_OUTPUT: {
      ID: 0x0013,
      NAME: "multistateOutput",
      ATTRIBUTES: Readonly<MultistateOutputClusterAttributes>,
      COMMANDS: Readonly<MultistateOutputClusterCommands>,
    },
    MULTI_STATE_VALUE: {
      ID: 0x0014,
      NAME: "multistateValue",
      ATTRIBUTES: Readonly<MultistateValueClusterAttributes>,
      COMMANDS: Readonly<MultistateValueClusterCommands>,
    },
    OTA: {
      ID: 0x0019,
      NAME: "ota",
      ATTRIBUTES: Readonly<OTAClusterAttributes>,
      COMMANDS: Readonly<OTAClusterCommands>,
    },
    POWER_PROFILE: {
      ID: 0x001a,
      NAME: "powerProfile",
      ATTRIBUTES: Readonly<PowerProfileClusterAttributes>,
      COMMANDS: Readonly<PowerProfileClusterCommands>,
    },
    POLL_CONTROL: {
      ID: 0x0020,
      NAME: "pollControl",
      ATTRIBUTES: Readonly<PollControlClusterAttributes>,
      COMMANDS: Readonly<PollControlClusterCommands>,
    },
    SHADE_CONFIGURATION: {
      ID: 0x0100,
      NAME: "shadeConfiguration",
      ATTRIBUTES: Readonly<ShadeConfigurationClusterAttributes>,
      COMMANDS: Readonly<ShadeConfigurationClusterCommands>,
    },
    DOOR_LOCK: {
      ID: 0x0101,
      NAME: "doorLock",
      ATTRIBUTES: Readonly<DoorLockClusterAttributes>,
      COMMANDS: Readonly<DoorLockClusterCommands>,
    },
    WINDOW_COVERING: {
      ID: 0x0102,
      NAME: "windowCovering",
      ATTRIBUTES: Readonly<WindowCoveringClusterAttributes>,
      COMMANDS: Readonly<WindowCoveringClusterCommands>,
    },
    THERMOSTAT: {
      ID: 0x0201,
      NAME: "thermostat",
      ATTRIBUTES: Readonly<ThermostatClusterAttributes>,
      COMMANDS: Readonly<ThermostatClusterCommands>,
    },
    PUMP_CONFIGURATION_AND_CONTROL: {
      ID: 0x0200,
      NAME: "pumpConfigurationAndControl",
      ATTRIBUTES: Readonly<PumpConfigurationAndControlClusterAttributes>,
      COMMANDS: Readonly<PumpConfigurationAndControlClusterCommands>,
    },
    FAN_CONTROL: {
      ID: 0x0202,
      NAME: "fanControl",
      ATTRIBUTES: Readonly<FanControlClusterAttributes>,
      COMMANDS: Readonly<FanControlClusterCommands>,
    },
    COLOR_CONTROL: {
      ID: 0x0300,
      NAME: "colorControl",
      ATTRIBUTES: Readonly<ColorControlClusterAttributes>,
      COMMANDS: Readonly<ColorControlClusterCommands>,
    },
    BALLAST_CONFIGURATION: {
      ID: 0x0301,
      NAME: "ballastConfiguration",
      ATTRIBUTES: Readonly<BallastConfigurationClusterAttributes>,
      COMMANDS: Readonly<BallastConfigurationClusterCommands>,
    },
    ILLUMINANCE_MEASUREMENT: {
      ID: 0x0400,
      NAME: "illuminanceMeasurement",
      ATTRIBUTES: Readonly<IlluminanceMeasurementClusterAttributes>,
      COMMANDS: Readonly<IlluminanceMeasurementClusterCommands>,
    },
    ILLUMINANCE_LEVEL_SENSING: {
      ID: 0x0401,
      NAME: "illuminanceLevelSensing",
      ATTRIBUTES: Readonly<IlluminanceLevelSensingClusterAttributes>,
      COMMANDS: Readonly<IlluminanceLevelSensingClusterCommands>,
    },
    TEMPERATURE_MEASUREMENT: {
      ID: 0x0402,
      NAME: "temperatureMeasurement",
      ATTRIBUTES: Readonly<TemperatureMeasurementClusterAttributes>,
      COMMANDS: Readonly<TemperatureMeasurementClusterCommands>,
    },
    PRESSURE_MEASUREMENT: {
      ID: 0x0403,
      NAME: "pressureMeasurement",
      ATTRIBUTES: Readonly<PressureMeasurementClusterAttributes>,
      COMMANDS: Readonly<PressureMeasurementClusterCommands>,
    },
    FLOW_MEASUREMENT: {
      ID: 0x0404,
      NAME: "flowMeasurement",
      ATTRIBUTES: Readonly<FlowMeasurementClusterAttributes>,
      COMMANDS: Readonly<FlowMeasurementClusterCommands>,
    },
    RELATIVE_HUMIDITY_MEASUREMENT: {
      ID: 0x0405,
      NAME: "relativeHumidity",
      ATTRIBUTES: Readonly<RelativeHumidityClusterAttributes>,
      COMMANDS: Readonly<RelativeHumidityClusterCommands>,
    },
    OCCUPANCY_SENSING: {
      ID: 0x0406,
      NAME: "occupancySensing",
      ATTRIBUTES: Readonly<OccupancySensingClusterAttributes>,
      COMMANDS: Readonly<OccupancySensingClusterCommands>,
    },
    IAS_ZONE: {
      ID: 0x0500,
      NAME: "iasZone",
      ATTRIBUTES: Readonly<IASZoneClusterAttributes>,
      COMMANDS: Readonly<IASZoneClusterCommands>,
    },
    IAS_ACE: {
      ID: 0x0501,
      NAME: "iasACE",
      ATTRIBUTES: Readonly<IASACEClusterAttributes>,
      COMMANDS: Readonly<IASACEClusterCommands>,
    },
    IAS_WD: {
      ID: 0x0502,
      NAME: "iasWD",
      ATTRIBUTES: Readonly<IASWDClusterAttributes>,
      COMMANDS: Readonly<IASWDClusterCommands>,
    },
    METERING: {
      ID: 0x0702,
      NAME: "metering",
      ATTRIBUTES: Readonly<MeteringClusterAttributes>,
      COMMANDS: Readonly<MeteringClusterCommands>,
    },
    ELECTRICAL_MEASUREMENT: {
      ID: 0x0b04,
      NAME: "electricalMeasurement",
      ATTRIBUTES: Readonly<ElectricalMeasurementClusterAttributes>,
      COMMANDS: Readonly<ElectricalMeasurementClusterCommands>,
    },
    DIAGNOSTICS: {
      ID: 0x0b05,
      NAME: "diagnostics",
      ATTRIBUTES: Readonly<DiagnosticsClusterAttributes>,
      COMMANDS: Readonly<DiagnosticsClusterCommands>,
    },
    TOUCHLINK: {
      ID: 0x1000,
      NAME: "touchlink",
      ATTRIBUTES: Readonly<TouchLinkClusterAttributes>,
      COMMANDS: Readonly<TouchLinkClusterCommands>,
    },
  };

  import {EventEmitter} from "events";
  import {ZigBeeNode} from "homey";
  type ZCLDataTypes = typeof import('@athombv/data-types').DataTypes & {
    enum8Status: ZCLDataType<types.ZCLEnum8Status>
  };

  function debug(flag: boolean, namespaces: string): void;

  class ZCLNode extends EventEmitter {
    constructor(node: ZigBeeNode);
    endpoints: Record<number, ZCLNodeEndpoint>;

    getLogId(endpointId: number, clusterId: number): string;
  }

  class ZCLNodeEndpoint extends EventEmitter {
    constructor(node: ZCLNode, descriptor: {
      endpointId: number;
      inputClusters: number[];
      outputClusters: number[];
    }[]);
    clusters: Record<string, Cluster<any, any>>;
    bindings: Record<string, BoundCluster>;

    bind(clusterName: string, clusterImpl: BoundCluster): void;
    unbind(clusterName: string): void;

    makeDefaultResponseFrame(receivedFrame: unknown, success: boolean, status: types.ZCLEnum8Status): typeof zclFrames.ZCLStandardHeader | typeof zclFrames.ZCLMfgSpecificHeader;
  }

  type ZCLDataType<Value> = import('@athombv/data-types').DataType<Value>;
  const ZCLDataTypes: ZCLDataTypes;
  const ZCLStruct: typeof import('@athombv/data-types').Struct;

  namespace zclTypes {
    type ZCLDataType<Value> = import('@athombv/data-types').DataType<Value>;
    const ZCLDataTypes: ZCLDataTypes;
    const ZCLStruct: typeof import('@athombv/data-types').Struct;
  }

  namespace zclFrames {
    const ZCLStandardHeader: import('@athombv/data-types').StaticStruct<{
      frameControl: types.ZCLFrameControlBitmap,
      trxSequenceNumber: ZCLDataTypes["data8"],
      cmdId: ZCLDataTypes["data8"],
      data: ZCLDataTypes["buffer"],
    }>;
    const ZCLMfgSpecificHeader: import('@athombv/data-types').StaticStruct<{
      frameControl: types.ZCLFrameControlBitmap,
      manufacturerId: ZCLDataTypes["uint16"],
      trxSequenceNumber: ZCLDataTypes["data8"],
      cmdId: ZCLDataTypes["data8"],
      data: ZCLDataTypes["buffer"],
    }>;
    function ZCLAttributeDataRecord(withStatus: boolean, attributes: types.AttributeDefinitions): ZCLDataType<{
      id: number,
      name?: string,
      status?: types.ZCLEnum8Status
      value?: ZCLDataType<any>
    }>;
    function ZCLConfigureReportingRecords({ withStatus }: {withStatus?: boolean}): ZCLDataType<Array<{
      attributeId: number,
      status?: types.ZCLEnum8Status,
      direction: 'reported' | 'received',
      attributeDataType?: number,
      minInterval?: number,
      maxInterval?: number,
      minChange?: number,
      timeoutPeriod?: number,
    }>>
  }

  class ZCLError extends Error {
    zclStatus: types.ZCLEnum8Status;
  }

  const ZIGBEE_PROFILE_ID: {
    INDUSTRIAL_PLANT_MONITORING: 0x0101,
    HOME_AUTOMATION: 0x0104,
    COMMERCIAL_BUILDING_AUTOMATION: 0x0105,
    TELECOM_APPLICATIONS: 0x0107,
    PERSONAL_HOME_AND_HOSPITAL_CARE: 0x0108,
    ADVANCED_METERING_INITIATIVE: 0x0109,
  };
  const ZIGBEE_DEVICE_ID: {
    GENERIC: {
      ON_OFF_SWITCH: 0x0000,
      LEVEL_CONTROL_SWITCH: 0x0001,
      ON_OFF_OUTPUT: 0x0002,
      LEVEL_CONTROLLABLE_OUTPUT: 0x0003,
      SCENE_SELECTOR: 0x0004,
      CONFIGURATION_TOOL: 0x0005,
      REMOTE_CONTROL: 0x0006,
      COMBINED_INTERFACE: 0x0007,
      RANGE_EXTENDER: 0x0008,
      MAINS_POWER_OUTLET: 0x0009,
      DOOR_LOCK: 0x000a,
      DOOR_LOCK_CONTROLLER: 0x000b,
      SIMPLE_SENSOR: 0x000c,
      CONSUMPTION_AWARENESS_DEVICE: 0x000d,
      HOME_GATEWAY: 0x0050,
      SMART_PLUG: 0x0051,
      WHITE_GOODS: 0x0052,
      METER_INTERFACE: 0x0053,
    },
    LIGHTING: {
      ON_OFF_LIGHT: 0x0100,
      DIMMABLE_LIGHT: 0x0101,
      COLOR_DIMMABLE_LIGHT: 0x0102,
      ON_OFF_LIGHT_SWITCH: 0x0103,
      DIMMER_SWITCH: 0x0104,
      COLOR_DIMMER_SWITCH: 0x0105,
      LIGHT_SENSOR: 0x0106,
      OCCUPANCY_SENSOR: 0x0107,
    },
    CLOSURES: {
      SHADE: 0x0200,
      SHADE_CONTROLLER: 0x0201,
      WINDOW_COVERING_DEVICE: 0x0202,
      WINDOW_COVERING_CONTROLLER: 0x0203,
    },
    HVAC: {
      HEATING_COOLING_UNIT: 0x0300,
      THERMOSTAT: 0x0301,
      TEMPERATURE_SENSOR: 0x0302,
      PUMP: 0x0303,
      PUMP_CONTROLLER: 0x0304,
      PRESSURE_SENSOR: 0x0305,
      FLOW_SENSOR: 0x0306,
    },
    INTRUDER_ALARM_SYSTEMS: {
      IAS_CONTROL_INDICATING_EQUIPMENT: 0x0400,
      IAS_ANCILLARY_CONTROL_EQUIPMENT: 0x0401,
      IAS_ZONE: 0x0402,
      IAS_WARNING_DEVICE: 0x0403,
    },
  };
  const IAS_ZONE_TYPE: {
    STANDARD_CIE: 0x0000,
    MOTION_SENSOR: 0x000d,
    CONTACT_SWITCH: 0x0015,
    FIRE_SENSOR: 0x0028,
    WATER_SENSOR: 0x002a,
    CARBON_MONOXIDE_SENSOR: 0x002b,
    PERSONAL_EMERGENCY_DEVICE: 0x002c,
    VIBRATION_MOVEMENT_SENSOR: 0x002d,
    REMOTE_CONTROL: 0x010f,
    KEY_FOB: 0x0115,
    KEYPAD: 0x021d,
    STANDARD_WARNING_DEVICE: 0x0225,
    GLASS_BREAK_SENSOR: 0x0226,
    SECURITY_REPEATER: 0x0229,
    INVALID_ZONE_TYPE: 0xffff,
  };

  abstract class Cluster<Attributes extends types.AttributeDefinitions, Commands extends types.CommandDefinitions> extends EventEmitter {
    static get ID(): number;
    static get NAME(): string;
    // @ts-expect-error Type should be defined on non-abstract inheritors
    static get ATTRIBUTES(): Attributes;
    // @ts-expect-error Type should be defined on non-abstract inheritors
    static get COMMANDS(): Commands;

    static DIRECTION_SERVER_TO_CLIENT: types.CommandToClientDirection;
    static DIRECTION_CLIENT_TO_SERVER: types.CommandToServerDirection;

    get logId(): string;

    discoverCommandsGenerated({startValue, maxResults}?: {startValue?: number, maxResults?: number}, opts?: {timeout?: number}): Promise<Array<number>>;
    discoverCommandsReceived({startValue, maxResults}?: {startValue?: number, maxResults?: number}, opts?: {timeout?: number}): Promise<Array<number>>;

    readAttributes<K extends keyof (Attributes & types.GLOBAL_ATTRIBUTES) | number>(attributes: ReadonlyArray<K>, opts?: {timeout?: number}): Promise<{[attribute in K]: types.AttributesFromDefinition<Attributes & types.GLOBAL_ATTRIBUTES>[attribute]}>;
    writeAttributes<K extends keyof (Attributes & types.GLOBAL_ATTRIBUTES)>(attributes: {[attribute in K]: types.AttributesFromDefinition<Attributes & types.GLOBAL_ATTRIBUTES>[attribute]}, opts?: {timeout?: number}): Promise<{[attribute in K]: {id: number, status: 'SUCCESS' | 'FAILURE'}}>

    configureReporting(attributes: types.AttributeReportingConfiguration<Extract<keyof (Attributes & types.GLOBAL_ATTRIBUTES), string>>, opts?: {timeout?: number}): Promise<void>;
    readReportingConfiguration(attributes: ReadonlyArray<Extract<keyof (Attributes & types.GLOBAL_ATTRIBUTES), string> | number>, opts?: {timeout?: number}): Promise<Array<types.ReadReportingConfigurationResponse>>;

    discoverAttributes(opts?: {timeout?: number}): Promise<Array<string | number>>;
    discoverAttributesExtended(opts?: {timeout?: number}): Promise<Array<types.ExtendedAttributesResponse>>;

    sendFrame(data: object): Promise<void>;
    nextSeqNr(): number;

    static addCluster(clusterClass: typeof Cluster<any, any>): void;
    static removeCluster(clusterIdOrName: string | number): void;
    static getCluster<Attributes extends types.AttributeDefinitions, Commands extends types.CommandDefinitions>(clusterIdOrName: string | number): Cluster<Attributes, Commands>;

    on<Event extends Extract<keyof Attributes, string>>(eventName: `attr.${Event}`, listener: (value: types.AttributesFromDefinition<Attributes>[Event]) => void): this;
    on<Values extends Array<any> = unknown[]>(eventName: string, listener: (...args: Values) => void): this;

    attributes: Attributes & types.GLOBAL_ATTRIBUTES;
    attributesById: {[Attribute in keyof (Attributes & types.GLOBAL_ATTRIBUTES) as (Attributes & types.GLOBAL_ATTRIBUTES)[Attribute]['id']]: { name: Attribute } & (Attributes & types.GLOBAL_ATTRIBUTES)[Attribute] };

    commands: Commands & types.GLOBAL_COMMANDS;
    commandsById: {[Command in keyof Commands as Commands[Command]['id']]: Array<{name: Command} & Commands[Command]>}; // Adding the global commands here results in types too big for TypeScript
  }

  // TODO
  abstract class BoundCluster {
    endpoint: number;
    cluster: Cluster<any, any>;

    get logId(): string;
  }

  namespace types {
    type FrameControlFlag =
      'clusterSpecific'
      | 'manufacturerSpecific'
      | 'directionToClient'
      | 'disableDefaultResponse';
    type ZCLFrameControlBitmap = ZCLDataType<Bitmap<FrameControlFlag>>;

    type ZCLEnum8Status = 'SUCCESS' | 'FAILURE' | 'NOT_AUTHORIZED' | 'RESERVED_FIELD_NOT_ZERO' | 'MALFORMED_COMMAND' | 'UNSUP_CLUSTER_COMMAND' | 'UNSUP_GENERAL_COMMAND' | 'UNSUP_MANUF_CLUSTER_COMMAND' | 'UNSUP_MANUF_GENERAL_COMMAND' | 'INVALID_FIELD' | 'UNSUPPORTED_ATTRIBUTE' | 'INVALID_VALUE' | 'READ_ONLY' | 'INSUFFICIENT_SPACE' | 'DUPLICATE_EXISTS' | 'NOT_FOUND' | 'UNREPORTABLE_ATTRIBUTE' | 'INVALID_DATA_TYPE' | 'INVALID_SELECTOR' | 'WRITE_ONLY' | 'INCONSISTENT_STARTUP_STATE' | 'DEFINED_OUT_OF_BAND' | 'INCONSISTENT' | 'ACTION_DENIED' | 'TIMEOUT' | 'ABORT' | 'INVALID_IMAGE' | 'WAIT_FOR_DATA' | 'NO_IMAGE_AVAILABLE' | 'REQUIRE_MORE_IMAGE' | 'NOTIFICATION_PENDING' | 'HARDWARE_FAILURE' | 'SOFTWARE_FAILURE' | 'CALIBRATION_ERROR' | 'UNSUPPORTED_CLUSTER';

    type GLOBAL_ATTRIBUTES = {
      clusterRevision: { id: 0xfffd, type: ZCLDataTypes["uint16"] },
      attributeReportingStatus: {
        id: 0xfffe,
        type: ZCLDataType<"PENDING" | "COMPLETE">
      }
    };

    type GLOBAL_COMMANDS = {
      readAttributes: {
        id: 0x00,
        args: {
          attributes: ZCLDataType<Array<number>>,
        },
        response: {
          id: 0x01,
          args: {
            attributes: ZCLDataTypes["buffer"],
          },
        },
        global: true,
      },

      writeAttributes: {
        id: 0x02,
        args: {
          attributes: ZCLDataTypes["buffer"],
        },
        response: {
          id: 0x04,
          args: {
            attributes: ZCLDataType<Array<ZCLStructInstance<{
              status: ZCLDataTypes["enum8Status"],
              id: ZCLDataTypes["uint16"]
            }>>>
          },
        },
        global: true,
      },

      writeAttributesAtomic: {
        id: 0x03,
        args: {
          attributes: ZCLDataTypes["buffer"],
        },
        response: {
          id: 0x04,
          args: {
            attributes: ZCLDataType<Array<ZCLStructInstance<{
              status: ZCLDataTypes["enum8Status"],
              id: ZCLDataTypes["uint16"]
            }>>>
          },
        },
        global: true,
      },

      writeAttributesNoResponse: {
        id: 0x05,
        args: {
          attributes: ZCLDataTypes["buffer"],
        },
        global: true,
      },

      configureReporting: {
        id: 0x06,
        args: {
          reports: ReturnType<typeof zclFrames.ZCLConfigureReportingRecords>,
        },
        response: {
          id: 0x07,
          args: {
            reports: ZCLDataType<Array<ZCLStructInstance<{
              status: ZCLDataTypes["enum8Status"],
              direction: ZCLDataType<"reported" | "received">
              attributeId: ZCLDataTypes["uint16"]
            }>>>
          },
        },
        global: true,
      },

      readReportingConfiguration: {
        id: 0x08,
        args: {
          attributes: ZCLDataType<Array<ZCLStructInstance<{
            direction: ZCLDataType<"reported" | "received">
            attributeId: ZCLDataTypes["uint16"]
          }>>>,
        },
        response: {
          id: 0x09,
          args: {
            reports: ReturnType<typeof zclFrames.ZCLConfigureReportingRecords>,
          },
        },
        global: true,
      },

      reportAttributes: {
        id: 0x0A,
        args: {
          attributes: ZCLDataTypes["buffer"],
        },
        global: true,
      },

      defaultResponse: {
        id: 0x0B,
        args: {
          cmdId: ZCLDataTypes["uint8"],
          status: ZCLDataTypes["enum8Status"],
        },
        global: true,
      },

      discoverAttributes: {
        id: 0x0C,
        args: {
          startValue: ZCLDataTypes["uint16"],
          maxResults: ZCLDataTypes["uint8"],
        },
        response: {
          id: 0x0D,
          args: {
            lastResponse: ZCLDataTypes["bool"],
            attributes: ZCLDataType<Array<ZCLStructInstance<{
              id: ZCLDataTypes["uint16"],
              dataTypeId: ZCLDataTypes["uint8"],
            }>>>,
          },
        },
        global: true,
      },

      readAttributesStructured: {
        id: 0x0E,
        args: {
          attributes: ZCLDataType<Array<ZCLStructInstance<{
            attributeId: ZCLDataTypes["uint16"],
            indexPath: ZCLDataType<Array<ZCLDataTypes["uint16"]>>,
          }>>>,
        },
        response: {
          id: 0x01,
          args: {
            attributes: ZCLDataTypes["buffer"],
          },
        },
        global: true,
      },

      writeAttributesStructured: {
        id: 0x0F,
        args: {
          attributes: ZCLDataType<Array<ZCLStructInstance<{
            attributeId: ZCLDataTypes["uint16"],
            indexPath: ZCLDataType<Array<ZCLDataTypes["uint16"]>>,
            dataTypeId: ZCLDataTypes["uint8"],
            value: ZCLDataTypes["buffer"],
          }>>>,
        },
        response: {
          id: 0x10,
          args: {
            attributes: ZCLDataTypes["buffer"],
          },
        },
        global: true,
      },

      discoverCommandsReceived: {
        id: 0x11,
        args: {
          startValue: ZCLDataTypes["uint8"],
          maxResults: ZCLDataTypes["uint8"],
        },
        response: {
          id: 0x12,
          args: {
            lastResponse: ZCLDataTypes["bool"],
            commandIds: ZCLDataType<Array<ZCLDataTypes["uint8"]>>,
          },
        },
        global: true,
      },

      discoverCommandsGenerated: {
        id: 0x13,
        args: {
          startValue: ZCLDataTypes["uint8"],
          maxResults: ZCLDataTypes["uint8"],
        },
        response: {
          id: 0x14,
          args: {
            lastResponse: ZCLDataTypes["bool"],
            commandIds: ZCLDataType<Array<ZCLDataTypes["uint8"]>>,
          },
        },
        global: true,
      },

      discoverAttributesExtended: {
        id: 0x15,
        args: {
          startValue: ZCLDataTypes["uint16"],
          maxResults: ZCLDataTypes["uint8"],
        },
        response: {
          id: 0x16,
          args: {
            lastResponse: ZCLDataTypes["bool"],
            attributes: ZCLDataType<Array<ZCLStructInstance<{
              id: ZCLDataTypes["uint16"],
              dataTypeId: ZCLDataTypes["uint8"],
              acl: ZCLDataType<import('@athombv/data-types').Bitmap<'readable' | 'writable' | 'reportable'>>,
            }>>>,
          },
        },
        global: true,
      },
    };

    type ZCLStructInstance<Defs extends Record<string, ZCLDataType<any>>> = import('@athombv/data-types').StructInstance<Defs>

    type CommandToServerDirection = 'DIRECTION_CLIENT_TO_SERVER';
    type CommandToClientDirection = 'DIRECTION_SERVER_TO_CLIENT';
    type CommandDirection = CommandToServerDirection | CommandToClientDirection;

    type FromZCLDataType<DataType> = DataType extends ZCLDataType<infer InferredValue>? InferredValue : DataType;

    type AttributeDefinition = {
      id: number,
      type: ZCLDataType<any>,
      manufacturerId?: number,
    }

    type AttributeDefinitions = {
      [attributeName: string]: AttributeDefinition,
    }

    type AttributesFromDefinition<Definition extends AttributeDefinitions> = {
      [attribute in keyof Definition]: FromZCLDataType<Definition[attribute]['type']>
    }

    type CommandDefinition = {
      id: number,
      direction?: CommandDirection,
      args?: {
        [argName: string]: ZCLDataType<any>,
      }
      response?: CommandDefinition,
      frameControl?: FrameControlFlag[];
      encodeMissingFieldsBehavior?: 'default' | 'skip';
      global?: boolean;
    }

    type CommandDefinitions = {
      [commandName: string]: CommandDefinition,
    }

    type AttributeReportingConfiguration<AttributeKey extends string> = {
      [attribute in AttributeKey]: {
        minInterval?: number,
        maxInterval?: number,
        minChange?: number
      }
    }

    type ReadReportingConfigurationResponse = {
      status: ZCLEnum8Status,
      direction: 'reported'|'received';
      attributeId: number;
      attributeDataType?: number;
      minInterval?: number;
      maxInterval?: number;
      minChange?: number;
      timeoutPeriod?: number;
    }

    type ExtendedAttributesResponse = {
      name?: string;
      id: number;
      acl: {
        readable: boolean;
        writable: boolean;
        reportable: boolean;
      }
    }
  }
}
