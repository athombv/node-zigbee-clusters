// eslint-disable-next-line max-classes-per-file,lines-around-directive
'use strict';

const assert = require('assert');

const BoundCluster = require('../lib/BoundCluster');
const BasicCluster = require('../lib/clusters/basic');
const { ZCLError } = require('../lib/util');

// Attribute ids on the basic cluster.
const MODEL_ID = 0x0005;
const UNREGISTERED_ID = 0x1234;

/** Bind a BoundCluster to the basic cluster the way Endpoint.bind does, without a node. */
function bind(boundCluster) {
  boundCluster.cluster = BasicCluster;
  return boundCluster;
}

/** Decode the read-attributes response buffer back into status records. */
function readStatuses(response) {
  return BasicCluster.attributeArrayStatusDataType.fromBuffer(response.attributes, 0);
}

describe('BoundCluster attribute status codes', function() {
  describe('readAttributes', function() {
    it('reports UNSUPPORTED_ATTRIBUTE for an id the cluster does not define', async function() {
      const bound = bind(new class extends BoundCluster {}());
      const records = readStatuses(await bound.readAttributes({ attributes: [UNREGISTERED_ID] }));

      assert.equal(records.length, 1);
      assert.equal(records[0].id, UNREGISTERED_ID);
      // ZCL R8 2.5.2.2: an attribute that does not exist SHALL be UNSUPPORTED_ATTRIBUTE,
      // not FAILURE.
      assert.equal(records[0].status, 'UNSUPPORTED_ATTRIBUTE');
    });

    it('reports UNSUPPORTED_ATTRIBUTE for a defined but unimplemented attribute', async function() {
      const bound = bind(new class extends BoundCluster {}());
      const records = readStatuses(await bound.readAttributes({ attributes: [MODEL_ID] }));

      assert.equal(records[0].status, 'UNSUPPORTED_ATTRIBUTE');
    });

    it('still reports FAILURE when a getter throws', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          throw new Error('sensor offline');
        }

      }());
      const records = readStatuses(await bound.readAttributes({ attributes: [MODEL_ID] }));

      // The attribute exists, so this is a genuine failure and must not be masked as unsupported.
      assert.equal(records[0].status, 'FAILURE');
    });

    it('reports FAILURE when the value cannot be serialized', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          // A string too long for the one-octet length prefix of a ZCL character string.
          return 'x'.repeat(300);
        }

      }());
      const records = readStatuses(await bound.readAttributes({ attributes: [MODEL_ID] }));

      assert.equal(records[0].status, 'FAILURE');
    });

    it('reports UNSUPPORTED_ATTRIBUTE for a write-only attribute, not 0x8f', async function() {
      const bound = bind(new class extends BoundCluster {

        set modelId(value) {
          this._modelId = value;
        }

      }());
      const records = readStatuses(await bound.readAttributes({ attributes: [MODEL_ID] }));

      // ZCL R8 deprecates WRITE_ONLY and reassigns 0x8f to NOT_AUTHORIZED ("a request has been
      // made to read an attribute that the requestor is not authorized to read"), which is about
      // permission, not about the attribute being unreadable. R8 defines no read status for a
      // write-only attribute, so UNSUPPORTED_ATTRIBUTE stays the honest answer: not readable here.
      assert.equal(records[0].status, 'UNSUPPORTED_ATTRIBUTE');
    });

    it('honours a ZCLError thrown by a getter instead of flattening it to FAILURE', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          throw new ZCLError('NOT_AUTHORIZED');
        }

      }());
      const records = readStatuses(await bound.readAttributes({ attributes: [MODEL_ID] }));

      // The per-attribute status is data on the error, so an implementation can pick its own rather
      // than being limited to the two this class throws itself.
      assert.equal(records[0].status, 'NOT_AUTHORIZED');
    });

    it('still reports SUCCESS with a value for an implemented attribute', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          return 'Homey';
        }

      }());
      const records = readStatuses(await bound.readAttributes({ attributes: [MODEL_ID] }));

      assert.equal(records[0].status, 'SUCCESS');
      assert.equal(records[0].value, 'Homey');
    });

    it('reports a per-attribute status, not one status for the whole request', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          return 'Homey';
        }

      }());
      const records = readStatuses(
        await bound.readAttributes({ attributes: [MODEL_ID, UNREGISTERED_ID] }),
      );

      assert.equal(records.length, 2);
      assert.equal(records[0].status, 'SUCCESS');
      assert.equal(records[1].status, 'UNSUPPORTED_ATTRIBUTE');
    });
  });

  describe('writeAttributes', function() {
    /** Build the wire payload writeAttributes expects. */
    function writeBuffer(records) {
      const buf = Buffer.alloc(255);
      const len = BasicCluster.attributeArrayDataType.toBuffer(buf, records, 0);
      return buf.slice(0, len);
    }

    it('reports UNSUPPORTED_ATTRIBUTE for an attribute this device does not implement', async function() {
      const bound = bind(new class extends BoundCluster {}());
      const { attributes } = await bound.writeAttributes({
        attributes: writeBuffer([{ id: MODEL_ID, value: 'Homey' }]),
      });

      assert.equal(attributes[0].status, 'UNSUPPORTED_ATTRIBUTE');
    });

    it('reports READ_ONLY for an attribute exposed with a getter but no setter', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          return 'Homey';
        }

      }());
      const { attributes } = await bound.writeAttributes({
        attributes: writeBuffer([{ id: MODEL_ID, value: 'Other' }]),
      });

      // ZCL R8 2.5.4.2 check 3: a read-only attribute SHALL be READ_ONLY, not FAILURE.
      assert.equal(attributes[0].status, 'READ_ONLY');
    });

    it('honours a ZCLError thrown by a setter', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          return this._modelId;
        }

        set modelId(value) {
          throw new ZCLError('INVALID_VALUE');
        }

      }());
      const { attributes } = await bound.writeAttributes({
        attributes: writeBuffer([{ id: MODEL_ID, value: 'Other' }]),
      });

      assert.equal(attributes[0].status, 'INVALID_VALUE');
    });

    it('still reports SUCCESS for a writable attribute', async function() {
      const bound = bind(new class extends BoundCluster {

        get modelId() {
          return this._modelId;
        }

        set modelId(value) {
          this._modelId = value;
        }

      }());
      const { attributes } = await bound.writeAttributes({
        attributes: writeBuffer([{ id: MODEL_ID, value: 'Other' }]),
      });

      assert.equal(attributes[0].status, 'SUCCESS');
      assert.equal(bound.modelId, 'Other');
    });
  });
});
