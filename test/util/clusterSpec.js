'use strict';

const assert = require('assert');
const Cluster = require('../../lib/Cluster');

/**
 * ZCL Cluster specifications for completeness testing.
 * Based on ZCL Specification r8 (07-5123-08).
 */
const ZCL_SPEC = {
  /**
   * IAS Zone Cluster (0x0500) - ZCL 8.2
   */
  iasZone: {
    id: 0x0500,
    attributes: {
      // Mandatory
      zoneState: { id: 0x0000, mandatory: true },
      zoneType: { id: 0x0001, mandatory: true },
      zoneStatus: { id: 0x0002, mandatory: true },
      // Optional
      iasCIEAddress: { id: 0x0010, mandatory: false },
      zoneId: { id: 0x0011, mandatory: false },
      numberOfZoneSensitivityLevelsSupported: { id: 0x0012, mandatory: false },
      currentZoneSensitivityLevel: { id: 0x0013, mandatory: false },
    },
    commands: {
      // Client-to-Server
      zoneEnrollResponse: { id: 0x00, direction: 'clientToServer', mandatory: true },
      initiateNormalOperationMode: { id: 0x01, direction: 'clientToServer', mandatory: false },
      initiateTestMode: { id: 0x02, direction: 'clientToServer', mandatory: false },
      // Server-to-Client
      zoneStatusChangeNotification: { id: 0x00, direction: 'serverToClient', mandatory: true },
      zoneEnrollRequest: { id: 0x01, direction: 'serverToClient', mandatory: true },
    },
  },

  /**
   * Metering Cluster (0x0702) - ZCL 10.4
   */
  metering: {
    id: 0x0702,
    attributes: {
      // Reading Information Set (0x00 - 0x0F)
      currentSummationDelivered: { id: 0x0000, mandatory: true },
      currentSummationReceived: { id: 0x0001, mandatory: false },
      currentMaxDemandDelivered: { id: 0x0002, mandatory: false },
      currentMaxDemandReceived: { id: 0x0003, mandatory: false },
      dftSummation: { id: 0x0004, mandatory: false },
      dailyFreezeTime: { id: 0x0005, mandatory: false },
      powerFactor: { id: 0x0006, mandatory: false },
      readingSnapShotTime: { id: 0x0007, mandatory: false },
      currentMaxDemandDeliveredTime: { id: 0x0008, mandatory: false },
      currentMaxDemandReceivedTime: { id: 0x0009, mandatory: false },
      // Meter Status (0x0200 - 0x02FF)
      status: { id: 0x0200, mandatory: false },
      remainingBatteryLife: { id: 0x0201, mandatory: false },
      hoursInOperation: { id: 0x0202, mandatory: false },
      hoursInFault: { id: 0x0203, mandatory: false },
      // Formatting Set (0x0300 - 0x03FF) - Critical for value interpretation
      unitOfMeasure: { id: 0x0300, mandatory: true },
      multiplier: { id: 0x0301, mandatory: false },
      divisor: { id: 0x0302, mandatory: false },
      summationFormatting: { id: 0x0303, mandatory: true },
      demandFormatting: { id: 0x0304, mandatory: false },
      historicalConsumptionFormatting: { id: 0x0305, mandatory: false },
      meteringDeviceType: { id: 0x0306, mandatory: true },
      siteId: { id: 0x0307, mandatory: false },
      meterSerialNumber: { id: 0x0308, mandatory: false },
      // Historical Consumption (0x0400 - 0x04FF)
      instantaneousDemand: { id: 0x0400, mandatory: false },
      currentDayConsumptionDelivered: { id: 0x0401, mandatory: false },
      previousDayConsumptionDelivered: { id: 0x0403, mandatory: false },
    },
    commands: {
      // Most commands are optional per ZCL spec
      getProfile: { id: 0x00, direction: 'clientToServer', mandatory: false },
      requestMirror: { id: 0x01, direction: 'clientToServer', mandatory: false },
      getProfileResponse: { id: 0x00, direction: 'serverToClient', mandatory: false },
    },
  },

  /**
   * Temperature Measurement Cluster (0x0402) - ZCL 4.4
   */
  temperatureMeasurement: {
    id: 0x0402,
    attributes: {
      measuredValue: { id: 0x0000, mandatory: true },
      minMeasuredValue: { id: 0x0001, mandatory: true },
      maxMeasuredValue: { id: 0x0002, mandatory: true },
      tolerance: { id: 0x0003, mandatory: false },
    },
    commands: {},
  },

  /**
   * Relative Humidity Cluster (0x0405) - ZCL 4.7
   */
  relativeHumidity: {
    id: 0x0405,
    attributes: {
      measuredValue: { id: 0x0000, mandatory: true },
      minMeasuredValue: { id: 0x0001, mandatory: true },
      maxMeasuredValue: { id: 0x0002, mandatory: true },
      tolerance: { id: 0x0003, mandatory: false },
    },
    commands: {},
  },

  /**
   * Occupancy Sensing Cluster (0x0406) - ZCL 4.8
   */
  occupancySensing: {
    id: 0x0406,
    attributes: {
      occupancy: { id: 0x0000, mandatory: true },
      occupancySensorType: { id: 0x0001, mandatory: true },
      occupancySensorTypeBitmap: { id: 0x0002, mandatory: true },
      // PIR Configuration
      pirOccupiedToUnoccupiedDelay: { id: 0x0010, mandatory: false },
      pirUnoccupiedToOccupiedDelay: { id: 0x0011, mandatory: false },
      pirUnoccupiedToOccupiedThreshold: { id: 0x0012, mandatory: false },
    },
    commands: {},
  },

  /**
   * Power Configuration Cluster (0x0001) - ZCL 3.3
   */
  powerConfiguration: {
    id: 0x0001,
    attributes: {
      // Mains Information
      mainsVoltage: { id: 0x0000, mandatory: false },
      mainsFrequency: { id: 0x0001, mandatory: false },
      // Battery Information
      batteryVoltage: { id: 0x0020, mandatory: false },
      batteryPercentageRemaining: { id: 0x0021, mandatory: false },
      // Battery Settings
      batteryManufacturer: { id: 0x0030, mandatory: false },
      batterySize: { id: 0x0031, mandatory: false },
      batteryQuantity: { id: 0x0033, mandatory: false },
      batteryRatedVoltage: { id: 0x0034, mandatory: false },
      batteryAlarmMask: { id: 0x0035, mandatory: false },
      batteryVoltageMinThreshold: { id: 0x0036, mandatory: false },
    },
    commands: {},
  },

  /**
   * Thermostat Cluster (0x0201) - ZCL 6.3
   */
  thermostat: {
    id: 0x0201,
    attributes: {
      // Thermostat Information
      localTemperature: { id: 0x0000, mandatory: true },
      outdoorTemperature: { id: 0x0001, mandatory: false },
      occupancy: { id: 0x0002, mandatory: false },
      // Setpoint Limits
      absMinHeatSetpointLimit: { id: 0x0003, mandatory: false },
      absMaxHeatSetpointLimit: { id: 0x0004, mandatory: false },
      absMinCoolSetpointLimit: { id: 0x0005, mandatory: false },
      absMaxCoolSetpointLimit: { id: 0x0006, mandatory: false },
      // Setpoints
      occupiedCoolingSetpoint: { id: 0x0011, mandatory: false },
      occupiedHeatingSetpoint: { id: 0x0012, mandatory: false },
      unoccupiedCoolingSetpoint: { id: 0x0013, mandatory: false },
      unoccupiedHeatingSetpoint: { id: 0x0014, mandatory: false },
      // Limits
      minHeatSetpointLimit: { id: 0x0015, mandatory: false },
      maxHeatSetpointLimit: { id: 0x0016, mandatory: false },
      minCoolSetpointLimit: { id: 0x0017, mandatory: false },
      maxCoolSetpointLimit: { id: 0x0018, mandatory: false },
      // Control Sequence
      controlSequenceOfOperation: { id: 0x001B, mandatory: true },
      systemMode: { id: 0x001C, mandatory: true },
    },
    commands: {
      setSetpoint: { id: 0x00, direction: 'clientToServer', mandatory: false },
    },
  },

  /**
   * Window Covering Cluster (0x0102) - ZCL 7.4
   */
  windowCovering: {
    id: 0x0102,
    attributes: {
      windowCoveringType: { id: 0x0000, mandatory: true },
      currentPositionLiftPercentage: { id: 0x0008, mandatory: false },
      currentPositionTiltPercentage: { id: 0x0009, mandatory: false },
      configStatus: { id: 0x0007, mandatory: true },
      installedOpenLimitLift: { id: 0x0010, mandatory: false },
      installedClosedLimitLift: { id: 0x0011, mandatory: false },
      mode: { id: 0x0017, mandatory: true },
    },
    commands: {
      upOpen: { id: 0x00, direction: 'clientToServer', mandatory: true },
      downClose: { id: 0x01, direction: 'clientToServer', mandatory: true },
      stop: { id: 0x02, direction: 'clientToServer', mandatory: true },
      goToLiftPercentage: { id: 0x05, direction: 'clientToServer', mandatory: false },
      goToTiltPercentage: { id: 0x08, direction: 'clientToServer', mandatory: false },
    },
  },

  /**
   * Door Lock Cluster (0x0101) - ZCL 7.3
   */
  doorLock: {
    id: 0x0101,
    attributes: {
      lockState: { id: 0x0000, mandatory: true },
      lockType: { id: 0x0001, mandatory: true },
      actuatorEnabled: { id: 0x0002, mandatory: true },
      doorState: { id: 0x0003, mandatory: false },
      numberOfLogRecordsSupported: { id: 0x0010, mandatory: false },
      autoRelockTime: { id: 0x0023, mandatory: false },
    },
    commands: {
      lockDoor: { id: 0x00, direction: 'clientToServer', mandatory: true },
      unlockDoor: { id: 0x01, direction: 'clientToServer', mandatory: true },
      lockDoorResponse: { id: 0x00, direction: 'serverToClient', mandatory: true },
      unlockDoorResponse: { id: 0x01, direction: 'serverToClient', mandatory: true },
    },
  },
};

/**
 * Verifies a cluster implementation has all mandatory attributes.
 *
 * @param {string} clusterName - Cluster name (e.g., 'iasZone')
 * @returns {{ missing: string[], extra: string[], status: 'pass'|'fail' }}
 */
function verifyClusterAttributes(clusterName) {
  const spec = ZCL_SPEC[clusterName];
  if (!spec) {
    throw new Error(`Unknown cluster: ${clusterName}`);
  }

  const ClusterClass = Cluster.getCluster(spec.id);
  if (!ClusterClass) {
    throw new Error(`Cluster not registered: ${clusterName} (0x${spec.id.toString(16)})`);
  }

  const implementedAttrs = Object.keys(ClusterClass.ATTRIBUTES || {});
  const specAttrs = Object.keys(spec.attributes);
  const mandatoryAttrs = specAttrs.filter(a => spec.attributes[a].mandatory);

  const missing = mandatoryAttrs.filter(a => !implementedAttrs.includes(a));
  const extra = implementedAttrs.filter(a => !specAttrs.includes(a) && !['clusterRevision', 'attributeReportingStatus'].includes(a));

  return {
    missing,
    extra,
    implemented: implementedAttrs,
    status: missing.length === 0 ? 'pass' : 'fail',
  };
}

/**
 * Asserts a cluster has all mandatory attributes.
 *
 * @param {string} clusterName - Cluster name
 */
function assertClusterComplete(clusterName) {
  const result = verifyClusterAttributes(clusterName);
  assert.strictEqual(
    result.status,
    'pass',
    `Cluster ${clusterName} missing mandatory attributes: ${result.missing.join(', ')}`,
  );
}

module.exports = {
  ZCL_SPEC,
  verifyClusterAttributes,
  assertClusterComplete,
};
