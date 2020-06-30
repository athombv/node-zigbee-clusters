'use strict';

const Cluster = require('../Cluster');
const BasicCluster = require('./basic');
const PowerConfigurationCluster = require('./powerConfiguration');
const DeviceTemperatureCluster = require('./deviceTemperature');
const IdentifyCluster = require('./identify');
const GroupsCluster = require('./groups');
const ScenesCluster = require('./scenes');
const OnOffCluster = require('./onOff');
const OnOffSwitchCluster = require('./onOffSwitch');
const LevelControlCluster = require('./levelControl');
const MultistateInputCluster = require('./multistateInput');
const OTACluster = require('./ota');
const PollControlCluster = require('./pollControl');
const WindowCoveringCluster = require('./windowCovering');
const ColorControlCluster = require('./colorControl');
const IlluminanceMeasurementCluster = require('./illuminanceMeasurement');
const TemperatureMeasurementCluster = require('./temperatureMeasurement');
const OccupancySensingCluster = require('./occupancySensing');
const MeteringCluster = require('./metering')
const ElectricalMeasurementCluster = require('./electricalMeasurement');
const DiagnosticsCluster = require('./diagnostics');
const TouchLinkCluster = require('./touchlink');
const BallastConfigurationCluster = require('./ballastConfiguration');

/**
 * Destructure desired constant properties from Cluster classes.
 * @param {number} ID
 * @param {string} NAME
 * @param {object} ATTRIBUTES
 * @param {object} COMMANDS
 * @returns {Readonly<{ATTRIBUTES: *, COMMANDS: *, ID: *, NAME: *}>}
 * @private
 */
function destructConstProps({
  ID, NAME, ATTRIBUTES, COMMANDS,
}) {
  return Object.freeze({
    ID, NAME, ATTRIBUTES, COMMANDS,
  });
}

module.exports = {
  Cluster,
  BasicCluster, // 0
  PowerConfigurationCluster, // 1
  DeviceTemperatureCluster, // 2
  IdentifyCluster, // 3
  GroupsCluster, // 4
  ScenesCluster, // 5
  OnOffCluster, // 6
  OnOffSwitchCluster, // 7
  LevelControlCluster, // 8
  MultistateInputCluster, // 0x0012 => 18
  OTACluster, // 0x0019 => 25
  PollControlCluster, // 0x0020 => 32
  WindowCoveringCluster, // 0x0102 => 258
  ColorControlCluster, // 0x0300 => 768
  IlluminanceMeasurementCluster, // 0x0400 => 1024
  TemperatureMeasurementCluster, // 0x0402 => 1026
  OccupancySensingCluster, // 0x0406 => 1030
  MeteringCluster, // 0x0702 => 1794
  ElectricalMeasurementCluster, // 0x0b04 => 2820
  DiagnosticsCluster, // 0x0b05 => 2821
  TouchLinkCluster, // 0x1000 => 4096
  BallastConfigurationCluster, // 0x0301 => 769
  CLUSTER: {
    BASIC: destructConstProps(BasicCluster),
    POWER_CONFIGURATION: destructConstProps(PowerConfigurationCluster),
    DEVICE_TEMPERATURE: destructConstProps(DeviceTemperatureCluster),
    IDENTIFY: destructConstProps(IdentifyCluster),
    GROUPS: destructConstProps(GroupsCluster),
    SCENES: destructConstProps(ScenesCluster),
    ON_OFF: destructConstProps(OnOffCluster),
    ON_OFF_SWITCH: destructConstProps(OnOffSwitchCluster),
    LEVEL_CONTROL: destructConstProps(LevelControlCluster),
    MULTI_STATE_INPUT: destructConstProps(MultistateInputCluster),
    OTA: destructConstProps(OTACluster),
    POLL_CONTROL: destructConstProps(PollControlCluster),
    WINDOW_COVERING: destructConstProps(WindowCoveringCluster),
    COLOR_CONTROL: destructConstProps(ColorControlCluster),
    ILLUMINANCE_MEASUREMENT: destructConstProps(IlluminanceMeasurementCluster),
    TEMPERATURE_MEASUREMENT: destructConstProps(TemperatureMeasurementCluster),
    OCCUPANCY_SENSING: destructConstProps(OccupancySensingCluster),
    METERING: destructConstProps(MeteringCluster),
    ELECTRICAL_MEASUREMENT: destructConstProps(ElectricalMeasurementCluster),
    DIAGNOSTICS: destructConstProps(DiagnosticsCluster),
    TOUCHLINK: destructConstProps(TouchLinkCluster),
    BALLAST_CONFIGURATION: destructConstProps(BallastConfigurationCluster),
  },
};
