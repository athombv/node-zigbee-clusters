'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const Cluster = require('../lib/Cluster');
const { ZCLDataTypes } = require('../lib/zclTypes');
const BoundCluster = require('../lib/BoundCluster');
const SceneCluster = require('../lib/clusters/scenes');

const MANUFACTURER_ID_1 = 0x1234;
const MANUFACTURER_ID_2 = 0x4321;

class IkeaSceneCluster extends SceneCluster {
  static get ATTRIBUTES() {
    return {
      sceneCount: {
        id: 0,
        type: ZCLDataTypes.uint8,
        manufacturerId: MANUFACTURER_ID_1, // Fake manufacturer specific attribute
      },
      currentScene: {
        id: 1,
        type: ZCLDataTypes.uint8,
        manufacturerId: MANUFACTURER_ID_2, // Fake manufacturer specific attribute
      },
      currentGroup: {
        id: 2,
        type: ZCLDataTypes.uint16,
        manufacturerId: MANUFACTURER_ID_2, // Fake manufacturer specific attribute
      },
      sceneValid: {
        id: 3,
        type: ZCLDataTypes.bool,
      },
    };
  }

  static get COMMANDS() {
    return {
      ...super.COMMANDS,
      ikeaSceneStep: {
        id: 0x07,
        manufacturerId: 0x117c,
        args: {
          mode: ZCLDataTypes.enum8({
            up: 0,
            down: 1,
          }),
          stepSize: ZCLDataTypes.uint8,
          transitionTime: ZCLDataTypes.uint16,
        },
      },
      ikeaSceneMove: {
        id: 0x08,
        manufacturerId: 0x117c,
        args: {
          mode: ZCLDataTypes.enum8({
            up: 0,
            down: 1,
          }),
          transitionTime: ZCLDataTypes.uint16,
        },
      },
      ikeaSceneMoveStop: {
        id: 0x09,
        manufacturerId: 0x117c,
        args: {
          duration: ZCLDataTypes.uint16,
        },
      },
    };
  }
}

Cluster.addCluster(IkeaSceneCluster);
const { createSingleClusterDevice } = require('./util/virtualDevice');

/**
 * Sends `command` from a scenes cluster to a virtual device that answers with BoundCluster's
 * defaults, and returns what went on the wire.
 */
async function send(command, bound = new BoundCluster()) {
  const { zclNode, frames } = createSingleClusterDevice(SceneCluster, bound);

  const result = command(zclNode.endpoints[1].clusters.scenes);
  return { result, frames };
}

/** Asserts the single frame the scenes cluster sent carries `manufacturerId`. */
async function assertSentManufacturerId(command, manufacturerId) {
  const { result, frames } = await send(command);
  // Only the request is under test: BoundCluster's defaults reject some of these commands.
  await result.catch(() => {});
  const sent = frames.filter((frame) => frame.from === 'zclNode');
  assert.strictEqual(sent.length, 1);
  assert.strictEqual(sent[0].frame.manufacturerId, manufacturerId);
}

/** Asserts that mixing manufacturers is rejected before anything is sent. */
async function assertRejectsMixedManufacturers(command) {
  const { result, frames } = await send(command);
  await assert.rejects(result, /multiple manufacturer ids/);
  assert.deepStrictEqual(frames, []);
}

describe('manufacturer specific commands', function () {
  it('should execute custom commands', async function () {
    const received = {};
    const { result, frames } = await send(
      async (scenes) => {
        await scenes.ikeaSceneStep({ mode: 'up', stepSize: 1, transitionTime: 13 });
        await scenes.ikeaSceneMove({ mode: 'up', transitionTime: 13 });
        await scenes.ikeaSceneMoveStop({ duration: 1000 });
      },
      new (class extends BoundCluster {
        async ikeaSceneStep(payload) {
          received.ikeaSceneStep = { ...payload };
        }

        async ikeaSceneMove(payload) {
          received.ikeaSceneMove = { ...payload };
        }

        async ikeaSceneMoveStop(payload) {
          received.ikeaSceneMoveStop = { ...payload };
        }
      })(),
    );
    await result;

    assert.deepStrictEqual(received, {
      ikeaSceneStep: { mode: 'up', stepSize: 1, transitionTime: 13 },
      ikeaSceneMove: { mode: 'up', transitionTime: 13 },
      ikeaSceneMoveStop: { duration: 1000 },
    });
    const sent = frames.filter((frame) => frame.from === 'zclNode');
    assert.deepStrictEqual(
      sent.map(({ frame }) => frame.manufacturerId),
      [0x117c, 0x117c, 0x117c],
    );
  });

  describe('global commands', function () {
    describe('readAttributes', function () {
      it('should set correct manufacturerId', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.readAttributes(['sceneCount']),
          MANUFACTURER_ID_1,
        );
      });
      it('should throw when different manufacturerIds are found', async function () {
        await assertRejectsMixedManufacturers((scenes) =>
          scenes.readAttributes(['sceneCount', 'currentScene']),
        );
      });
      it('should set correct manufacturerId for multiple attributes', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.readAttributes(['currentScene', 'currentGroup']),
          MANUFACTURER_ID_2,
        );
      });
      it('should not set manufacturerId when zcl attribute is present', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.readAttributes(['sceneValid']),
          undefined,
        );
      });
    });

    describe('writeAttributes', function () {
      it('should set correct manufacturerId', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.writeAttributes({ sceneCount: 1 }),
          MANUFACTURER_ID_1,
        );
      });
      it('should throw when different manufacturerIds are found', async function () {
        await assertRejectsMixedManufacturers((scenes) =>
          scenes.writeAttributes({ sceneCount: 1, currentScene: 2 }),
        );
      });
      it('should set correct manufacturerId for multiple attributes', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.writeAttributes({ currentScene: 1, currentGroup: 2 }),
          MANUFACTURER_ID_2,
        );
      });
      it('should not set manufacturerId when zcl attribute is present', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.writeAttributes({ sceneValid: true }),
          undefined,
        );
      });
    });

    describe('configureReporting', function () {
      const reporting = { minInterval: 0, maxInterval: 300, minChange: 1 };

      it('should set correct manufacturerId', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.configureReporting({ sceneCount: reporting }),
          MANUFACTURER_ID_1,
        );
      });
      it('should throw when different manufacturerIds are found', async function () {
        await assertRejectsMixedManufacturers((scenes) =>
          scenes.configureReporting({ sceneCount: reporting, currentScene: reporting }),
        );
      });
      it('should set correct manufacturerId for multiple attributes', async function () {
        await assertSentManufacturerId(
          (scenes) =>
            scenes.configureReporting({ currentScene: reporting, currentGroup: reporting }),
          MANUFACTURER_ID_2,
        );
      });
      it('should not set manufacturerId when zcl attribute is present', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.configureReporting({ sceneValid: reporting, currentGroup: reporting }),
          undefined,
        );
      });
    });

    describe('readReportingConfiguration', function () {
      it('should set correct manufacturerId', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.readReportingConfiguration(['sceneCount']),
          MANUFACTURER_ID_1,
        );
      });
      it('should throw when different manufacturerIds are found', async function () {
        await assertRejectsMixedManufacturers((scenes) =>
          scenes.readReportingConfiguration(['sceneCount', 'currentScene']),
        );
      });
      it('should set correct manufacturerId for multiple attributes', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.readReportingConfiguration(['currentGroup', 'currentScene']),
          MANUFACTURER_ID_2,
        );
      });
      it('should not set manufacturerId when zcl attribute is present', async function () {
        await assertSentManufacturerId(
          (scenes) => scenes.readReportingConfiguration(['currentGroup', 'sceneValid']),
          undefined,
        );
      });
    });
  });
});
