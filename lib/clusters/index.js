const BasicCluster = require('./basic'); //0
const PowerCluster = require('./power'); //1
const DeviceTemperatureCluster = require('./deviceTemperature'); //2
const IdentifyCluster = require('./identify'); //3
const GroupsCluster = require('./groups'); //4
const ScenesCluster = require('./scenes'); //5
const OnOffCluster = require('./onOff'); //6
const OnOffSwitchCluster = require('./onOffSwitch'); //7
const LevelCluster = require('./level'); //8
const MultistateInputCluster = require('./multistateInput'); //0x0012
const OTACluster = require('./ota'); //0x0019
const PollControlCluster = require('./pollControl'); //0x0020
const ColorControlCluster = require('./colorControl'); //0x0300
const DiagnosticsCluster = require('./diagnostics'); //0x0b05
const TouchLinkCluster = require('./touchlink'); //0x1000

module.exports = {
    BasicCluster,
    PowerCluster,
    DeviceTemperatureCluster,
    IdentifyCluster,
    GroupsCluster,
    ScenesCluster,
    OnOffCluster,
    OnOffSwitchCluster,
    LevelCluster,
    MultistateInputCluster,
    OTACluster,
    PollControlCluster,
    ColorControlCluster,
    DiagnosticsCluster,
    TouchLinkCluster
};