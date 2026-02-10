# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Commands

```bash
npm test              # Run all tests (mocha)
npm run lint          # ESLint (extends athom config)
npm run build         # Generate JSDoc documentation
```

Run single test file:
```bash
npx mocha test/onOff.js
```

## Architecture

Zigbee Cluster Library (ZCL) implementation for Node.js, designed for Homey's Zigbee stack.

### Core Classes

- **ZCLNode** (`lib/Node.js`) - Entry point. Wraps Homey's ZigBeeNode, manages endpoints, routes incoming frames.
- **Endpoint** (`lib/Endpoint.js`) - Represents device endpoint. Contains `clusters` (client) and `bindings` (server). Routes frames to appropriate cluster.
- **Cluster** (`lib/Cluster.js`) - Base class for all clusters. Handles frame parsing, command execution, attribute operations. Commands auto-generate methods via `_addPrototypeMethods`.
- **BoundCluster** (`lib/BoundCluster.js`) - Server-side cluster for receiving commands from remote nodes.

### Data Flow

```
ZCLNode.handleFrame() → Endpoint.handleFrame() → Cluster/BoundCluster.handleFrame()
Cluster.sendCommand() → Endpoint.sendFrame() → ZCLNode.sendFrame()
```

### Cluster Implementation Pattern

Each cluster in `lib/clusters/` follows:
1. Define `ATTRIBUTES` object with `{id, type}` using `ZCLDataTypes`
2. Define `COMMANDS` object with `{id, args?}`
3. Extend `Cluster` with static getters: `ID`, `NAME`, `ATTRIBUTES`, `COMMANDS`
4. Call `Cluster.addCluster(MyCluster)` to register

Example: `lib/clusters/onOff.js`

### Key Types

- `ZCLDataTypes` - Primitive types (uint8, bool, enum8, etc.) from `@athombv/data-types`
- `ZCLStruct` - Composite types for command arguments
- `CLUSTER` constant - Maps cluster names to `{ID, NAME, ATTRIBUTES, COMMANDS}`

### Cluster ID References

Prefer `Cluster.ID` over hardcoded numbers:
```javascript
// Good
const OnOffCluster = require('../lib/clusters/onOff');
inputClusters: [OnOffCluster.ID]

// Avoid
inputClusters: [6]
inputClusters: [0x0006]
```

### Test Pattern

Tests use mock nodes from `test/util/mockNode.js`:

**Single node with loopback** (command → same node's BoundCluster):
```javascript
const { createMockNode } = require('./util');
const OnOffCluster = require('../lib/clusters/onOff');

const node = createMockNode({
  loopback: true,
  endpoints: [{ endpointId: 1, inputClusters: [OnOffCluster.ID] }],
});

node.endpoints[1].bind('onOff', new (class extends BoundCluster {
  async setOn() { /* handle command */ }
})());

await node.endpoints[1].clusters.onOff.setOn(); // loops back to BoundCluster
```

**Connected node pair** (node A sends → node B receives):
```javascript
const { createConnectedNodePair } = require('./util');

const [sender, receiver] = createConnectedNodePair(
  { endpoints: [{ endpointId: 1, inputClusters: [6] }] },
  { endpoints: [{ endpointId: 1, inputClusters: [6] }] },
);

receiver.endpoints[1].bind('onOff', new BoundCluster());
await sender.endpoints[1].clusters.onOff.toggle();
```

**Server-to-client notifications** (device → controller) still require manual frames:
```javascript
const { ZCLStandardHeader } = require('../lib/zclFrames');

node.endpoints[1].clusters.iasZone.onZoneStatusChangeNotification = data => { ... };

const frame = new ZCLStandardHeader();
frame.cmdId = IASZoneCluster.COMMANDS.zoneStatusChangeNotification.id;
frame.frameControl.directionToClient = true;
frame.frameControl.clusterSpecific = true;
frame.data = Buffer.from([...]);

node.handleFrame(1, IASZoneCluster.ID, frame.toBuffer(), {});
```

**Preset mock devices** for common sensor types:
```javascript
const { MOCK_DEVICES } = require('./util');

const sensor = MOCK_DEVICES.motionSensor();
const boundCluster = sensor.endpoints[1].bindings.iasZone;
```

## Key Files

- `index.js` - Public exports
- `lib/clusters/index.js` - All cluster exports + `CLUSTER` constant
- `lib/zclTypes.js` - ZCL data types
- `lib/zclFrames.js` - ZCL frame parsing/serialization

---

## Adding/Updating Cluster Definitions

Reusable guide for adding new clusters or updating existing cluster definitions.

### Source Reference

- **Spec PDF**: `docs/zigbee-cluster-specification-r8.pdf`
- **Extract text**: `pdftotext docs/zigbee-cluster-specification-r8.pdf -`
- **Cluster files**: `lib/clusters/*.js`

---

### File Structure Template

```javascript
'use strict';

const Cluster = require('../Cluster');
const { ZCLDataTypes } = require('../zclTypes');

// Reusable enum definitions (if needed)
const EXAMPLE_ENUM = ZCLDataTypes.enum8({
  value1: 0,
  value2: 1,
});

// ============================================================================
// Server Attributes
// ============================================================================
const ATTRIBUTES = {
  // Section Name (0x0000 - 0x000F)

  // Description from spec, copied 1-on-1.
  // Multi-line if needed, wrapped at 100 chars.
  attrName: { id: 0x0000, type: ZCLDataTypes.uint8 }, // Mandatory
};

// ============================================================================
// Commands
// ============================================================================
const COMMANDS = {
  // --- Client to Server Commands ---

  // Description from spec.
  commandName: { // Mandatory
    id: 0x0000,
    args: {
      argName: ZCLDataTypes.uint8,
    },
    response: {
      id: 0x0000,
      args: { status: ZCLDataTypes.uint8 },
    },
  },

  // --- Server to Client Commands ---

  // Description from spec.
  notificationName: { // Optional
    id: 0x0020, // 32
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      argName: ZCLDataTypes.uint8,
    },
  },
};

class ExampleCluster extends Cluster {
  static get ID() {
    return 0x0000; // Add decimal comment if > 9, e.g.: return 0x0101; // 257
  }

  static get NAME() {
    return 'example';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }
}

Cluster.addCluster(ExampleCluster);
module.exports = ExampleCluster;
```

---

### Comment Format Rules

1. **Description placement**: ABOVE the attribute/command
2. **M/O marker placement**:
   - Single-line: at END of line (`attrName: { ... }, // Mandatory`)
   - Multi-line: on OPENING brace (`attrName: { // Mandatory`)
   - NEVER on closing brace
3. **Copy exactly**: Text from spec, 1-on-1
4. **Skip if >5 sentences**: Skip and only refer to section in spec
5. **Line wrap**: Respect 100 char limit (ESLint)
6. **M/O source for attrs**: Server-side column in spec table
7. **M/O source for cmds**:
   - Server "receives" → server-side M/O
   - Server "generates" → client-side M/O
8. **Conditional (M*)**: Use `// Conditional¹` with footnote for attrs/cmds marked "M*" in spec
   - Reason on new line below: `// ¹ Reason here`
   - Shared reasons use same footnote number

#### Example

```javascript
currentLevel: { id: 0x0000, type: ZCLDataTypes.uint8 }, // Mandatory
pirOccupiedToUnoccupiedDelay: { id: 0x0010, type: ZCLDataTypes.uint16 }, // 16, Conditional¹
pirUnoccupiedToOccupiedDelay: { id: 0x0011, type: ZCLDataTypes.uint16 }, // 17, Conditional¹
// ¹ PIR sensor type supported
```

---

### Attribute Definition Rules

| Field | Format | Notes |
|-------|--------|-------|
| `id` | Hex (`0x0000`) | Always 4-digit format (0x0000); add decimal comment if > 9 |
| `type` | `ZCLDataTypes.*` | See type reference below |
| M/O | Inline comment | `// Mandatory`, `// Optional`, or `// Conditional` |

#### Hex with Decimal Comments

For hex values > 9 (where hex differs from decimal), add decimal in comment:
```javascript
id: 0x000A, // 10
id: 0x0010, // 16
id: 0x0100, // 256
```

For values 0-9, no decimal comment needed:
```javascript
id: 0x0000,
id: 0x0009,
```

For multi-line definitions, decimal goes on the `id:` line, M/O on opening brace:
```javascript
operatingMode: { // Optional
  id: 0x0025, // 37
  type: ZCLDataTypes.enum8({
    normal: 0,
    vacation: 1,
  }),
},
```

#### Section Comments

Group attrs by function with section headers:
```javascript
// Section Name (0x0000 - 0x000F)
attr1: { ... },
attr2: { ... },

// Another Section (0x0010 - 0x001F)
attr3: { ... },
```

---

### Command Definition Rules

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Always 4-digit hex format (0x0000); add decimal comment if > 9 |
| `args` | If has params | Object with typed fields |
| `response` | If expects response | Has own `id` and `args` |
| `direction` | For server→client | `Cluster.DIRECTION_SERVER_TO_CLIENT` |

#### Command Sections

```javascript
// --- Client to Server Commands ---
lockDoor: { id: 0x0000, ... }, // Mandatory

// --- Server to Client Commands ---
operationEventNotification: { // Optional
  id: 0x0020, // 32
  direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
  ...
},
```

#### Command Direction Rules

Focus on **client→server commands** with inline `response:` when applicable:
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

**Server→client commands** (events/notifications) should be evaluated per case:
- Implement if commonly needed (e.g., `operationEventNotification` for door locks)
- Skip obscure or rarely-used notifications unless specifically requested
- These require `direction: Cluster.DIRECTION_SERVER_TO_CLIENT`

---

### ZCLDataTypes Reference

#### Primitives
- `bool`, `uint8`, `uint16`, `uint24`, `uint32`, `uint48`, `uint64`
- `int8`, `int16`, `int24`, `int32`
- `string`, `octstr`

#### Enums
```javascript
ZCLDataTypes.enum8({
  valueName: 0,
  anotherValue: 1,
})
```

#### Bitmaps
```javascript
ZCLDataTypes.map8('bit0', 'bit1', 'bit2')
ZCLDataTypes.map16('bit0', 'bit1', ...)
ZCLDataTypes.map64(...)
```

#### Arrays
```javascript
ZCLDataTypes.Array0(ZCLDataTypes.uint8)
ZCLDataTypes.Array8(...)
```

#### Reusable Enums
Define at module level if used multiple times:
```javascript
const USER_STATUS_ENUM = ZCLDataTypes.enum8({
  available: 0,
  occupied: 1,
});

// Then use in commands:
args: { userStatus: USER_STATUS_ENUM }
```

#### Reusable Bitmaps
Same pattern for bitmaps used multiple times:
```javascript
const ALARM_MASK = ZCLDataTypes.map8(
  'generalHardwareFault',
  'generalSoftwareFault',
  'reserved2',
  'reserved3',
);

// Then use in attributes/commands:
alarmMask: { id: 0x0010, type: ALARM_MASK },
```

---

### Workflow: Adding/Updating a Cluster

#### 1. Extract Spec Section
```bash
pdftotext docs/zigbee-cluster-specification-r8.pdf - | grep -A 500 "X.Y.Z Cluster Name"
```

#### 2. Identify Elements
From spec tables, extract:
- Cluster ID and Name
- All attributes (ID, name, type, M/O)
- All commands (ID, name, args, direction, M/O)
- Descriptions (≤5 sentences)

#### 3. Create/Update File
- Use template above
- Follow naming: `lib/clusters/clusterName.js`
- Export in `lib/clusters/index.js`

#### 4. Validate
```bash
npm run lint
npm test
npm run build
```

---

### Checklist for Each Cluster

- [ ] Cluster ID correct (hex in class, matches spec)
- [ ] Cluster NAME matches spec (camelCase)
- [ ] All mandatory attrs present with `// Mandatory`
- [ ] All mandatory cmds present with `// Mandatory`
- [ ] Conditional attrs/cmds marked `// Conditional` (M* in spec)
- [ ] Optional attrs/cmds marked `// Optional`
- [ ] Descriptions copied from spec (≤5 sentences)
- [ ] Section comments group related attrs
- [ ] Client/server cmd sections separated
- [ ] Server→client cmds have `direction` field
- [ ] Responses defined where applicable
- [ ] Reusable enums/bitmaps extracted if used 2+ times
- [ ] Hex IDs used consistently (with decimal comments if > 9)
- [ ] Lint passes
- [ ] Tests pass

---

### Reference Examples

- **Best documented**: `lib/clusters/doorLock.js`
- **Simple attrs only**: `lib/clusters/metering.js`
- **Color/enum heavy**: `lib/clusters/colorControl.js`
