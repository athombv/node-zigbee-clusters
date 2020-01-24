const BasicCluster = require('./basic'); //0
const PowerConfigurationCluster = require('./powerConfiguration'); //1
const DeviceTemperatureCluster = require('./deviceTemperature'); //2
const IdentifyCluster = require('./identify'); //3
const GroupsCluster = require('./groups'); //4
const ScenesCluster = require('./scenes'); //5
const OnOffCluster = require('./onOff'); //6
const OnOffSwitchCluster = require('./onOffSwitch'); //7
const LevelCluster = require('./levelControl'); //8
const MultistateInputCluster = require('./multistateInput'); //0x0012
const WindowCovering = require('./windowCovering'); //0x0102
const IlluminanceMeasurement = require('./illuminanceMeasurement'); //0x0400
const TemperatureMeasurement = require('./temperatureMeasurement'); //0x0402
const OccupancySensing = require('./occupancySensing'); //0x0406
const OTACluster = require('./ota'); //0x0019
const PollControlCluster = require('./pollControl'); //0x0020
const ColorControlCluster = require('./colorControl'); //0x0300
const ElectricalMeasurement = require('./electricalMeasurement'); //0x0b04
const DiagnosticsCluster = require('./diagnostics'); //0x0b05
const TouchLinkCluster = require('./touchlink'); //0x1000

module.exports = {
    BasicCluster,
    PowerConfigurationCluster,
    DeviceTemperatureCluster,
    IdentifyCluster,
    GroupsCluster,
    ScenesCluster,
    OnOffCluster,
    OnOffSwitchCluster,
    LevelCluster,
    MultistateInputCluster,
    WindowCovering,
    IlluminanceMeasurement,
    TemperatureMeasurement,
    OccupancySensing,
    OTACluster,
    PollControlCluster,
    ColorControlCluster,
    ElectricalMeasurement,
    DiagnosticsCluster,
    TouchLinkCluster
};