# Adding or updating a cluster definition

A cluster definition in `lib/clusters/*.js` is data, not code: ids, types, and the specification
text that explains them. `Cluster._addPrototypeMethods` turns each entry in `COMMANDS` into a method
at registration time, so there is nothing to implement beyond the definition itself.

This page describes the conventions those definitions follow. See
[Contributing](../README.md#contributing) for the checks every pull request has to pass.

## Spec source

Three revisions are checked in as `docs/zigbee-cluster-specification-r{6,7,8}.pdf`. Write
definitions against r8. r6 and r7 are there to look up what an older revision said about a
definition that devices in the field still implement.

Each cluster has its own numbered section. From its tables you need the cluster id and name, every
attribute (id, name, type, mandatory or optional) and every command (id, name, arguments, direction,
mandatory or optional).

## Writing the file

The clearest way in is an existing cluster:

- `lib/clusters/doorLock.js` carries spec comments, mandatory and optional markers and conditional
  footnotes, so it shows what a fully documented cluster looks like.
- `lib/clusters/ota.js` shows optional and variant command fields.
- `lib/clusters/onOff.js` is a minimal definition with no spec comments, which is what most of the
  older clusters look like.

Name the file after the cluster in camelCase, call `Cluster.addCluster()` at the bottom, and export
it from `lib/clusters/index.js`.

Data types come from `@athombv/data-types`; `lib/zclTypes.js` re-exports them as `ZCLDataTypes` and
adds `enum8Status`. The set is wider than the handful most clusters use:

```bash
node -e "console.log(Object.keys(require('./lib/zclTypes').ZCLDataTypes).join(' '))"
```

Define an enum or bitmap at module level as soon as two definitions share it.

## Ids

Both `static get ID()` and the attribute and command ids are written in a mix of hex and decimal
across the repo. Leave a file's existing style alone rather than reformatting around your change.

New definitions use four-digit lowercase hex for attribute and command ids, with the decimal in a
comment where the two differ:

```javascript
id: 0x0000,
id: 0x000a, // 10
id: 0x0100, // 256
```

For a multi-line definition the decimal goes on the `id:` line.

## Spec comments

The description from the specification goes above the attribute or command, copied as written and
wrapped to the Prettier width. When it runs past five sentences, name the spec section instead.

Each entry carries a literal `// Mandatory`, `// Optional` or `// Conditional` comment. The marker
goes at the end of the line for a single-line definition, and on its own line directly above the key
for a multi-line one. Not on the opening brace, where Prettier pulls it inside and it reads as if it
belongs to `id`, and not on the closing brace.

For attributes the marker comes from the server-side column of the spec table. For commands, server
"receives" is the server-side value and server "generates" the client-side one. An entry the spec
marks `M*` is conditional, with the condition as a numbered footnote below the group:

```javascript
numberOfPINUsersSupported: { id: 0x0012, type: ZCLDataTypes.uint16 }, // 18, Conditional¹
numberOfRFIDUsersSupported: { id: 0x0013, type: ZCLDataTypes.uint16 }, // 19, Conditional²
// ¹ PIN credential support
// ² RFID credential support
```

Most of the older clusters carry no markers at all, so adding one attribute to such a file does not
mean backfilling the rest.

## Commands

Client-to-server commands take an inline `response` where the spec has one:

```javascript
lockDoor: {
  id: 0x0000,
  args: { pinCode: ZCLDataTypes.octstr },
  response: {
    id: 0x0000,
    args: { status: ZCLDataTypes.uint8 },
  },
},
```

A server-to-client command is defined standalone, carrying
`direction: Cluster.DIRECTION_SERVER_TO_CLIENT`, only when the server can send it unsolicited: a
notification such as `operationEventNotification`, or a response that doubles as one such as
`upgradeEndResponse`. A response that only ever follows a request, such as
`queryNextImageResponse`, is already covered by the inline `response` and must not be repeated.

### Optional and variant fields

`encodeMissingFieldsBehavior: 'skip'` belongs on any struct where some fields are optional, and is
left off when every field is mandatory. This holds for a `response` struct as much as for the
command itself. When the fields present depend on another field's value, list them all and comment
each group, as `imageBlockResponse` in `lib/clusters/ota.js` does:

```javascript
response: {
  id: 0x0005,
  encodeMissingFieldsBehavior: 'skip',
  args: {
    status: ZCLDataTypes.enum8Status,
    // When status is SUCCESS
    manufacturerCode: ZCLDataTypes.uint16,
    fileOffset: ZCLDataTypes.uint32,
    imageData: ZCLDataTypes.buffer,
    // When status is WAIT_FOR_DATA
    currentTime: ZCLDataTypes.uint32,
    requestTime: ZCLDataTypes.uint32,
  },
},
```

## Testing the definition

A definition is worth a test when it encodes or decodes something a plain attribute list does not:
command arguments, a variant payload, a notification. `test/onOff.js` is the smallest example,
`test/ota.js` covers variant fields. The mock node helpers live in `test/util/index.js`.

## Before opening a pull request

Run `npm run generate-types` on top of the usual lint, format and test commands. `index.d.ts` is
generated from the cluster definitions and committed, so changing a definition changes it too.
