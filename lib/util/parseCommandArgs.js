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
/**
 * Minimum payload length we'll accept before invoking the parser.
 *
 * For commands declared with `encodeMissingFieldsBehavior: 'skip'`, trailing
 * fields may be intentionally omitted (e.g. OTA `hardwareVersion` is only
 * present when its `fieldControl` bit is set). We can't derive the strict
 * minimum from the struct alone, but every such command in practice has a
 * mandatory leading discriminator (status, fieldControl, payloadType) that
 * determines which subsequent fields are present. Without that leading byte,
 * the parsed result is meaningless; with it, the parser correctly omits
 * optional trailing fields.
 *
 * So for 'skip' commands we require at least the first field's byte width.
 * For non-'skip' commands we require the full fixed-portion length.
 *
 * @param {object} argsType - The ZCLStruct class for this command's args.
 * @param {boolean} skipMode - Whether the command uses `encodeMissingFieldsBehavior: 'skip'`.
 * @returns {number} Minimum byte length the payload must carry.
 */
function computeMinLength(argsType, skipMode) {
  if (!skipMode) {
    // Struct.length convention:
    //   > 0 : exact byte count for an all-fixed-size struct
    //   < 0 : negative of the fixed-portion size for a varsize struct
    //   = 0 : no payload required
    return Math.abs(argsType.length);
  }

  const firstField = Object.values(argsType.fields)[0];
  if (!firstField) return 0;
  // Fixed-width field's length is a positive integer; varsize is negative or 0.
  // For varsize first fields (uncommon for 'skip' commands), require at least
  // 1 byte so the length prefix is present.
  return firstField.length > 0 ? firstField.length : 1;
}

function parseCommandArgs(command, data) {
  const argsType = command.args;
  const skipMode = command.encodeMissingFieldsBehavior === 'skip';

  const minLength = computeMinLength(argsType, skipMode);
  if (data.length < minLength) {
    throw new ZCLError('MALFORMED_COMMAND');
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
