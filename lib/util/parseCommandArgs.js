'use strict';

const { ZCLError } = require('./index');

/**
 * Parse a ZCL command's argument payload with defensive length validation.
 *
 * The underlying parser primitives in `@athombv/data-types` silently fall back
 * to zero-filled values when the source buffer is shorter than the declared
 * field length. For example, an empty payload parsed against a fixed-size
 * struct produces an object where every numeric field is 0 and every bitmap
 * field has all bits clear. This is unsafe for alarm-routing clusters (IAS
 * Zone) and for status-bearing response frames, where the zero values happen
 * to mean "all clear" / "SUCCESS".
 *
 * This helper rejects truncated payloads up-front by throwing a ZCLError with
 * status `MALFORMED_COMMAND`, which `Endpoint.handleFrame` converts into a
 * proper default-response frame back to the sender.
 *
 * @param {object} command - Cluster command definition (with `args` Struct).
 * @param {Buffer} data - Frame payload bytes.
 * @returns {object} Parsed args instance.
 * @throws {ZCLError} With zclStatus `MALFORMED_COMMAND` when parsing fails or
 *   the payload is shorter than the args struct's minimum byte length.
 */
function parseCommandArgs(command, data) {
  const argsType = command.args;

  // Commands declared with `encodeMissingFieldsBehavior: 'skip'` allow trailing
  // fields to be omitted (e.g. OTA `hardwareVersion` is only present when its
  // fieldControl bit is set). For those we cannot derive a strict minimum from
  // the struct definition and rely on the try/catch below to catch overruns.
  if (command.encodeMissingFieldsBehavior !== 'skip') {
    // Struct.length convention:
    //   > 0 : exact byte count for an all-fixed-size struct
    //   < 0 : negative of the fixed-portion size for a varsize struct
    //   = 0 : no payload required
    // For both fixed and varsize structs, |declaredLength| is the minimum
    // number of bytes the payload must carry to populate the fixed fields.
    const minLength = Math.abs(argsType.length);
    if (data.length < minLength) {
      throw new ZCLError('MALFORMED_COMMAND');
    }
  }

  try {
    return argsType.fromBuffer(data, 0);
  } catch (err) {
    // The parser threw mid-walk (e.g. a varsize length prefix overran the
    // payload). Treat as malformed rather than letting the raw RangeError
    // propagate as a generic FAILURE.
    throw new ZCLError('MALFORMED_COMMAND');
  }
}

module.exports = parseCommandArgs;
