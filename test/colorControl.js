// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');
const BoundCluster = require('../lib/BoundCluster');
const ColorControlCluster = require('../lib/clusters/colorControl');
const Node = require('../lib/Node');
const { ZCLStandardHeader } = require('../lib/zclFrames');

const endpointId = 1;

describe('Color Control', function() {
  it('should receive moveToColor', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      ColorControlCluster.NAME,
      new (class extends BoundCluster {

        async moveToColor(data) {
          assert.strictEqual(data.colorX, 0x5000);
          assert.strictEqual(data.colorY, 0x3000);
          assert.strictEqual(data.transitionTime, 20);
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = ColorControlCluster.COMMANDS.moveToColor.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // colorX (uint16 LE): 0x5000, colorY (uint16 LE): 0x3000, transitionTime (uint16 LE): 20
    frame.data = Buffer.from([0x00, 0x50, 0x00, 0x30, 0x14, 0x00]);

    node.handleFrame(endpointId, ColorControlCluster.ID, frame.toBuffer(), {});
  });

  it('should receive moveToColorTemperature', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      ColorControlCluster.NAME,
      new (class extends BoundCluster {

        async moveToColorTemperature(data) {
          assert.strictEqual(data.colorTemperature, 370);
          assert.strictEqual(data.transitionTime, 15);
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = ColorControlCluster.COMMANDS.moveToColorTemperature.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // colorTemperature (uint16 LE): 370 = 0x0172, transitionTime (uint16 LE): 15 = 0x000F
    frame.data = Buffer.from([0x72, 0x01, 0x0F, 0x00]);

    node.handleFrame(endpointId, ColorControlCluster.ID, frame.toBuffer(), {});
  });

  it('should receive moveToHueAndSaturation', function(done) {
    const node = new Node({
      sendFrame: () => null,
      endpointDescriptors: [{
        endpointId,
        inputClusters: [ColorControlCluster.ID],
      }],
    });

    node.endpoints[endpointId].bind(
      ColorControlCluster.NAME,
      new (class extends BoundCluster {

        async moveToHueAndSaturation(data) {
          assert.strictEqual(data.hue, 180);
          assert.strictEqual(data.saturation, 200);
          assert.strictEqual(data.transitionTime, 10);
          done();
        }

      })(),
    );

    const frame = new ZCLStandardHeader();
    frame.cmdId = ColorControlCluster.COMMANDS.moveToHueAndSaturation.id;
    frame.frameControl.directionToClient = false;
    frame.frameControl.clusterSpecific = true;
    // hue (uint8): 180, saturation (uint8): 200, transitionTime (uint16 LE): 10
    frame.data = Buffer.from([0xB4, 0xC8, 0x0A, 0x00]);

    node.handleFrame(endpointId, ColorControlCluster.ID, frame.toBuffer(), {});
  });
});
