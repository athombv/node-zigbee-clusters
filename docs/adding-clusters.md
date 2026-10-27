# Adding or updating a cluster definition

Cluster definitions in `lib/clusters/*.js` are data: ids, types, and the spec text that explains
them. This describes the conventions that data follows.

## Spec source

The specification is checked in as `docs/zigbee-cluster-specification-r8.pdf`. Extract the section
you need, for example On/Off:

```bash
pdftotext docs/zigbee-cluster-specification-r8.pdf - | grep -A 500 "^3.8 On/Off"
```

From the spec tables, take the cluster id and name, every attribute (id, name, type, mandatory or
optional) and every command (id, name, arguments, direction, mandatory or optional).

## Writing the file

Copy the structure of an existing cluster rather than working from a template:

- `lib/clusters/doorLock.js` carries spec comments, mandatory and optional markers and conditional
  footnotes, so it is the one to copy for a cluster you intend to document fully.
- `lib/clusters/ota.js` shows optional and variant command fields.
- `lib/clusters/onOff.js` is a minimal definition with no spec comments, which is what most of the
  older clusters look like.

Name the file after the cluster in camelCase, call `Cluster.addCluster()` at the bottom, and export
it from `lib/clusters/index.js`.

Data types come from `@athombv/data-types`; `lib/zclTypes.js` re-exports them as `ZCLDataTypes` and
adds `enum8Status`. The set is wider than the handful most clusters use, so list it rather than
guess:

```bash
node -e "console.log(Object.keys(require('./lib/zclTypes').ZCLDataTypes).join(' '))"
```

Define an enum or bitmap at module level as soon as two definitions share it.

## Ids

Both `static get ID()` and the attribute and command ids are written in a mix of hex and decimal
across the repo. Match whichever the file you are editing already uses.

For a new file, prefer four-digit lowercase hex for attribute and command ids, with the decimal in a
comment where the two differ:

```javascript
id: 0x0000,
id: 0x000a, // 10
id: 0x0100, // 256
```

For a multi-line definition the decimal goes on the `id:` line.

## Spec comments

Put the description from the specification above the attribute or command, copied as written, and
wrapped to the Prettier width. Skip it when it runs past five sentences and name the spec section
instead.

Mark each entry with a literal `// Mandatory`, `// Optional` or `// Conditional` comment. The marker
goes at the end of the line for a single-line definition, and on its own line directly above the key
for a multi-line one. Never on the opening brace, where Prettier pulls it inside and it reads as if
it belongs to `id`, and never on the closing brace.

Take the marker for attributes from the server-side column of the spec table. For commands, read
server "receives" as the server-side value and server "generates" as the client-side one. An entry
the spec marks `M*` is conditional, with the condition as a numbered footnote below the group:

```javascript
numberOfPINUsersSupported: { id: 0x0012, type: ZCLDataTypes.uint16 }, // 18, Conditional¹
numberOfRFIDUsersSupported: { id: 0x0013, type: ZCLDataTypes.uint16 }, // 19, Conditional²
// ¹ PIN credential support
// ² RFID credential support
```

Most clusters carry no markers at all. If the file you open has none, annotate what you touch and
leave the rest.

## Commands

Define client-to-server commands with an inline `response` where the spec has one:

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

Add a server-to-client command standalone, with `direction: Cluster.DIRECTION_SERVER_TO_CLIENT`,
only when the server can send it unsolicited: a notification such as `operationEventNotification`,
or a response that doubles as one such as `upgradeEndResponse`. A response that only ever follows a
request, such as `queryNextImageResponse`, is already covered by the inline `response` and must not
be repeated.

### Optional and variant fields

Set `encodeMissingFieldsBehavior: 'skip'` when some fields are optional, and leave it off when every
field is mandatory. This applies to a `response` struct as much as to the command itself. When the
fields present depend on another field's value, list them all and comment each group, as
`imageBlockResponse` in `lib/clusters/ota.js` does:

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

## Before committing

Run `npm run generate-types` as well as the usual checks, because changing a cluster definition
changes the generated `index.d.ts`. See [AGENTS.md](../AGENTS.md) for the full command list.
