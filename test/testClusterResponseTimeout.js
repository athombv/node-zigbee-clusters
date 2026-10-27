'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

const Cluster = require('../lib/Cluster');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const OnOffCluster = require('../lib/clusters/onOff');
const BasicCluster = require('../lib/clusters/basic');
const AlarmsCluster = require('../lib/clusters/alarms');
const IasZoneCluster = require('../lib/clusters/iasZone');
const { createSingleClusterDevice } = require('./util/virtualDevice');

const togglingDevice = () =>
  createSingleClusterDevice(
    OnOffCluster,
    new (class extends BoundCluster {
      toggle() {}
    })(),
  );

/** Makes the device send `colliding(tsn)` with the request's TSN right before each reply. */
function collideBeforeReplies(intercept, colliding) {
  intercept(({ from, frame, raw }) =>
    from === 'virtualDevice' ? [colliding(frame.trxSequenceNumber), raw] : undefined,
  );
}

describe('Cluster Response Timeout', function () {
  it('should only start timeout after frame is sent', async function (t) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const { zclNode } = togglingDevice();
    const endpoint = zclNode.endpoints[1];
    const originalSendFrame = endpoint.sendFrame.bind(endpoint);
    // Delay sendFrame by 150ms (longer than timeout)
    t.mock.method(endpoint, 'sendFrame', async (...args) => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return originalSendFrame(...args);
    });

    // Start the command with 100ms timeout, if timeout starts immediately it will fire before
    // sendFrame completes and cause the command to fail
    const toggled = endpoint.clusters.onOff.toggle(undefined, { timeout: 100 });
    // Let the stubbed sendFrame reach its fake timer before advancing past the 100ms timeout.
    await Promise.resolve();
    t.mock.timers.tick(150);
    await toggled;
  });

  it('should clear timeout when response is received', async function (t) {
    const clearTimeoutSpy = t.mock.method(global, 'clearTimeout');
    const { zclNode } = createSingleClusterDevice(
      OnOffCluster,
      new (class extends BoundCluster {
        async toggle() {
          // Respond after sendFrame resolved
          return new Promise((resolve) => setImmediate(resolve));
        }
      })(),
    );

    await zclNode.endpoints[1].clusters.onOff.toggle(undefined, { timeout: 5000 });

    // Should have called clearTimeout to prevent timeout firing
    assert(
      clearTimeoutSpy.mock.callCount() > 0,
      'clearTimeout should be called when response received',
    );
  });

  it('should not wait for response when waitForResponse is false', async function () {
    const { zclNode, frames, intercept } = togglingDevice();
    // A device that never answers: waiting would time out
    intercept(({ from }) => (from === 'virtualDevice' ? null : undefined));

    const result = await zclNode.endpoints[1].clusters.onOff.toggle(undefined, {
      waitForResponse: false,
    });

    assert.strictEqual(result, undefined);
    assert.strictEqual(frames.length, 1);
  });

  it('should not resolve with a device-initiated frame that reuses the pending TSN', async function () {
    const { zclNode, intercept } = togglingDevice();
    // Device sends an attribute report numbered from its own counter, colliding with the TSN
    collideBeforeReplies(intercept, (tsn) =>
      Buffer.from([0x18, tsn, 0x0a, 0x00, 0x00, 0x10, 0x01]),
    );
    const reportedValues = [];
    zclNode.endpoints[1].clusters.onOff.on('attr.onOff', (value) => reportedValues.push(value));

    const result = await zclNode.endpoints[1].clusters.onOff.toggle();

    assert.deepStrictEqual(reportedValues, [true]);
    assert.strictEqual(result, undefined);
  });

  it('should resolve getAlarm with a Get Alarm Response alone', async function () {
    const { zclNode } = createSingleClusterDevice(
      AlarmsCluster,
      new (class extends BoundCluster {
        getAlarm() {
          return {
            status: 'SUCCESS',
            alarmCode: 2,
            clusterId: 6,
            timeStamp: 1234,
          };
        }
      })(),
    );

    const response = await zclNode.endpoints[1].clusters.alarms.getAlarm(undefined, {
      timeout: 1000,
    });

    assert.strictEqual(response.alarmCode, 2);
    assert.strictEqual(response.timeStamp, 1234);
  });

  it('should resolve a command without declared response on a cluster-specific reply', async function (t) {
    class TuyaLikeCluster extends Cluster {
      static get ID() {
        return 0xef00;
      }

      static get NAME() {
        return 'tuyaLike';
      }

      static get COMMANDS() {
        return {
          datapoint: { id: 0x00, args: { value: ZCLDataTypes.uint8 } },
          dataResponse: {
            id: 0x01,
            direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
            args: { value: ZCLDataTypes.uint8 },
          },
        };
      }
    }
    Cluster.addCluster(TuyaLikeCluster);
    t.after(() => Cluster.removeCluster(TuyaLikeCluster.ID));

    const { zclNode, virtualDevice } = createSingleClusterDevice(
      TuyaLikeCluster,
      new (class extends BoundCluster {
        // Reply like a Tuya MCU: its own command with the request's TSN, no Default Response
        async datapoint({ value }, meta, frame) {
          await virtualDevice.sendFrame(
            1,
            TuyaLikeCluster.ID,
            Buffer.from([0x19, frame.trxSequenceNumber, 0x01, value]),
          );
        }
      })(),
    );

    const response = await zclNode.endpoints[1].clusters.tuyaLike.datapoint(
      { value: 7 },
      { disableDefaultResponse: true, timeout: 1000 },
    );

    assert.strictEqual(response.value, 7);
  });

  it('should treat a declared response without id as the command id', async function (t) {
    class EchoCluster extends Cluster {
      static get ID() {
        return 0xfc01;
      }

      static get NAME() {
        return 'echo';
      }

      static get COMMANDS() {
        return {
          ping: {
            id: 0x05,
            args: { value: ZCLDataTypes.uint8 },
            response: { args: { value: ZCLDataTypes.uint8 } },
          },
          notify: {
            id: 0x06,
            direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
            args: { value: ZCLDataTypes.uint8 },
          },
        };
      }
    }
    Cluster.addCluster(EchoCluster);
    t.after(() => Cluster.removeCluster(EchoCluster.ID));

    const { zclNode, intercept } = createSingleClusterDevice(
      EchoCluster,
      new (class extends BoundCluster {
        async ping({ value }) {
          return { value };
        }
      })(),
    );
    // An unrelated device command reuses the TSN first, then the real response (id 0x05)
    collideBeforeReplies(intercept, (tsn) => Buffer.from([0x19, tsn, 0x06, 99]));

    const response = await zclNode.endpoints[1].clusters.echo.ping({ value: 7 }, { timeout: 1000 });

    assert.strictEqual(response.value, 7);
  });

  describe('pending response matching', function () {
    it('should not resolve a global command on a cluster-specific frame with its response id', async function () {
      const { zclNode, intercept } = createSingleClusterDevice(
        IasZoneCluster,
        new (class extends BoundCluster {
          get zoneState() {
            return 'enrolled';
          }
        })(),
      );
      // IAS Zone Enroll Request is cluster-specific 0x01, the same id as Read Attributes Response
      collideBeforeReplies(intercept, (tsn) =>
        Buffer.from([0x19, tsn, 0x01, 0x0d, 0x00, 0x00, 0x00]),
      );

      const result = await zclNode.endpoints[1].clusters.iasZone.readAttributes(['zoneState'], {
        timeout: 1000,
      });

      assert.deepStrictEqual(result, { zoneState: 'enrolled' });
    });

    it('should not resolve on a Default Response for another command', async function () {
      const { zclNode, intercept } = togglingDevice();
      // Default Response with FAILURE for cmdId 0x01 (on), while toggle (0x02) is pending
      collideBeforeReplies(intercept, (tsn) => Buffer.from([0x18, tsn, 0x0b, 0x01, 0x01]));

      await zclNode.endpoints[1].clusters.onOff.toggle(undefined, { timeout: 1000 });
    });
  });

  it('should resolve when the response arrives before sendFrame rejects', async function () {
    const { zclNode, settle } = togglingDevice();
    // The stack reports a failed send (e.g. no APS ACK in time) after the device already answered
    const sendFrame = zclNode.sendFrame;
    zclNode.sendFrame = async (...args) => {
      await sendFrame(...args);
      await settle();
      throw new Error('device not responding');
    };

    await zclNode.endpoints[1].clusters.onOff.toggle();
  });

  it('should reject when sendFrame rejects without a response', async function () {
    const { zclNode, intercept } = togglingDevice();
    intercept(() => {
      throw new Error('device not responding');
    });

    await assert.rejects(zclNode.endpoints[1].clusters.onOff.toggle(), /device not responding/);
  });

  it('should ignore a duplicate response without sending an error back', async function () {
    const { zclNode, frames, intercept, settle } = createSingleClusterDevice(
      BasicCluster,
      new (class extends BoundCluster {
        async readAttributesStructured() {
          // Attribute 0x0004, SUCCESS, string "_TZ3000"
          return {
            attributes: Buffer.from([0x04, 0x00, 0x00, 0x42, 0x07, ...Buffer.from('_TZ3000')]),
          };
        }
      })(),
    );
    // The device sends its response a second time, as some devices do
    intercept(({ from, raw }) => (from === 'virtualDevice' ? [raw, raw] : undefined));

    const response = await zclNode.endpoints[1].clusters.basic.readAttributesStructured(
      { attributes: [{ attributeId: 4, indexPath: [] }] },
      { timeout: 1000 },
    );
    await settle();

    assert.strictEqual(response.attributes.subarray(5).toString(), '_TZ3000');
    // Only the request went out, no error Default Response for the second copy
    assert.strictEqual(frames.filter(({ from }) => from === 'zclNode').length, 1);
  });
});
