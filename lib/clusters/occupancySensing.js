'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
  // Occupancy Sensor Information (0x0000 - 0x000F)
  occupancy: { id: 0x0000, type: ZCLDataTypes.map8('occupied') }, // Mandatory: bit 0 = occupied
  occupancySensorType: {
    id: 0x0001, // Mandatory
    type: ZCLDataTypes.enum8({
      pir: 0, // 0x00 PIR
      ultrasonic: 1, // 0x01 Ultrasonic
      pirAndUltrasonic: 2, // 0x02 PIR and ultrasonic
      physicalContact: 3, // 0x03 Physical Contact
    }),
  },
  occupancySensorTypeBitmap: {
    id: 0x0002, // Mandatory
    type: ZCLDataTypes.map8('pir', 'ultrasonic', 'physicalContact'),
  },

  // PIR Configuration (0x0010 - 0x001F)
  pirOccupiedToUnoccupiedDelay: { id: 0x0010, type: ZCLDataTypes.uint16 },
  pirUnoccupiedToOccupiedDelay: { id: 0x0011, type: ZCLDataTypes.uint16 },
  pirUnoccupiedToOccupiedThreshold: { id: 0x0012, type: ZCLDataTypes.uint8 },

  // Ultrasonic Configuration (0x0020 - 0x002F)
  ultrasonicOccupiedToUnoccupiedDelay: { id: 0x0020, type: ZCLDataTypes.uint16 },
  ultrasonicUnoccupiedToOccupiedDelay: { id: 0x0021, type: ZCLDataTypes.uint16 },
  ultrasonicUnoccupiedToOccupiedThreshold: { id: 0x0022, type: ZCLDataTypes.uint8 },

  // Physical Contact Configuration (0x0030 - 0x003F)
  physicalContactOccupiedToUnoccupiedDelay: { id: 0x0030, type: ZCLDataTypes.uint16 },
  physicalContactUnoccupiedToOccupiedDelay: { id: 0x0031, type: ZCLDataTypes.uint16 },
  physicalContactUnoccupiedToOccupiedThreshold: { id: 0x0032, type: ZCLDataTypes.uint8 },
};

const COMMANDS = {};

class OccupancySensing extends Cluster {

  static get ID() {
    return 1030; // 0x0406
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
