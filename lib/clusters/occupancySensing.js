'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Occupancy Sensor Information (0x0000 - 0x000F)
  occupancy: { id: 0x0000, type: ZCLDataTypes.map8('occupied') }, // Mandatory
  occupancySensorType: { // Mandatory
    id: 0x0001,
    type: ZCLDataTypes.enum8({
      pir: 0,
      ultrasonic: 1,
      pirAndUltrasonic: 2,
      physicalContact: 3,
    }),
  },
  occupancySensorTypeBitmap: { // Mandatory
    id: 0x0002,
    type: ZCLDataTypes.map8('pir', 'ultrasonic', 'physicalContact'),
  },

  // PIR Configuration (0x0010 - 0x001F)
  pirOccupiedToUnoccupiedDelay: { id: 0x0010, type: ZCLDataTypes.uint16 }, // 16, Optional
  pirUnoccupiedToOccupiedDelay: { id: 0x0011, type: ZCLDataTypes.uint16 }, // 17, Optional
  pirUnoccupiedToOccupiedThreshold: { id: 0x0012, type: ZCLDataTypes.uint8 }, // 18, Optional

  // Ultrasonic Configuration (0x0020 - 0x002F)
  ultrasonicOccupiedToUnoccupiedDelay: { id: 0x0020, type: ZCLDataTypes.uint16 }, // 32, Optional
  ultrasonicUnoccupiedToOccupiedDelay: { id: 0x0021, type: ZCLDataTypes.uint16 }, // 33, Optional
  ultrasonicUnoccupiedToOccupiedThreshold: { id: 0x0022, type: ZCLDataTypes.uint8 }, // 34, Optional

  // Physical Contact Configuration (0x0030 - 0x003F)
  physicalContactOccupiedToUnoccupiedDelay: { // Optional
    id: 0x0030, // 48
    type: ZCLDataTypes.uint16,
  },
  physicalContactUnoccupiedToOccupiedDelay: { // Optional
    id: 0x0031, // 49
    type: ZCLDataTypes.uint16,
  },
  physicalContactUnoccupiedToOccupiedThreshold: { // Optional
    id: 0x0032, // 50
    type: ZCLDataTypes.uint8,
  },
};

const COMMANDS = {};

class OccupancySensing extends Cluster {

  static get ID() {
    return 0x0406; // 1030
  }

  static get NAME() {
    return 'occupancySensing';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(OccupancySensing);

module.exports = OccupancySensing;
