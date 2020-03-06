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
const LevelCluster = require('./levelControl');
const MultistateInputCluster = require('./multistateInput');
const OTACluster = require('./ota');
const PollControlCluster = require('./pollControl');
const WindowCovering = require('./windowCovering');
const ColorControlCluster = require('./colorControl');
const IlluminanceMeasurement = require('./illuminanceMeasurement');
const TemperatureMeasurement = require('./temperatureMeasurement');
const OccupancySensing = require('./occupancySensing');
const ElectricalMeasurement = require('./electricalMeasurement');
const DiagnosticsCluster = require('./diagnostics');
const TouchLinkCluster = require('./touchlink');

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
  LevelCluster, // 8
  MultistateInputCluster, // 0x0012 => 18
  OTACluster, // 0x0019 => 25
  PollControlCluster, // 0x0020 => 32
  WindowCovering, // 0x0102 => 258
  ColorControlCluster, // 0x0300 => 768
  IlluminanceMeasurement, // 0x0400 => 1024
  TemperatureMeasurement, // 0x0402 => 1026
  OccupancySensing, // 0x0406 => 1030
  ElectricalMeasurement, // 0x0b04 => 2820
  DiagnosticsCluster, // 0x0b05 => 2821
  TouchLinkCluster, // 0x1000 => 4096
};
