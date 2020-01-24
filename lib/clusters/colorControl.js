const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

const ATTRIBUTES = {
    currentHue: { id: 0, type: ZCLDataTypes.uint8 },
    currentSaturation: { id: 1, type: ZCLDataTypes.uint8 },
    colorTemperatureMireds: { id: 7, type: ZCLDataTypes.uint16 },
    colorMode: {
        id: 8, type: ZCLDataTypes.enum8({
            currentHueAndCurrentSaturation: 0,
            currentXAndCurrentY: 1,
            colorTemperatureMireds: 2,
        })
    },
    colorTempPhysicalMinMireds: { id: 16395, type: ZCLDataTypes.uint16 },
    colorTempPhysicalMaxMireds: { id: 16396, type: ZCLDataTypes.uint16 },
};

const COMMANDS = {
    moveToHue: {
        id: 0, args: {
            hue: ZCLDataTypes.uint8,
            direction: ZCLDataTypes.enum8({ // TODO: ?
                shortestDistance: 0,
                longestDistance: 1,
                up: 2,
                down: 3,
            }),
            transitionTime: ZCLDataTypes.uint16,
        }
    },
    moveToSaturation: {
        id: 3, args: { // TODO
            saturation: ZCLDataTypes.uint8,
            transitionTime: ZCLDataTypes.uint16,
        }
    },
    moveToHueAndSaturation: {
        id: 6, args: {
            hue: ZCLDataTypes.uint8,
            saturation: ZCLDataTypes.uint8,
            transitionTime: ZCLDataTypes.uint16,
        }
    },
    moveToColor: {
        id: 7, args: {
            colorX: ZCLDataTypes.uint16,
            colorY: ZCLDataTypes.uint16,
            transitionTime: ZCLDataTypes.uint16,
        }
    },
    moveToColorTemperature: {
        id: 10, args: {
            colorTemperature: ZCLDataTypes.uint16,
            transitionTime: ZCLDataTypes.uint16,
        }
    },
};

class ColorControlCluster extends Cluster {

    static get ID() {
        return 768; // 0x0300
    }

    static get NAME() {
        return 'colorControl';
    }

    static get ATTRIBUTES() {
        return ATTRIBUTES;
    }

    static get COMMANDS() {
        return COMMANDS;
    }
}

Cluster.addCluster(ColorControlCluster);

module.exports = ColorControlCluster;