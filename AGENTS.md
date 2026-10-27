# AGENTS.md

Guidance for AI agents working in this repository. [README.md](README.md) documents the library,
contributing and releasing; this file covers what is not already obvious from the code.

## Setup and commands

`.nvmrc` pins the Node version and every workflow reads that same file. Run `nvm use` before
anything else; the machine default is likely newer.

```bash
npm test
node --test test/onOff.js
npm run lint            # ESLint, flat config in eslint.config.js
npm run format:check
npm run format:write    # run this before committing
npm run generate-types  # regenerate index.d.ts after changing cluster definitions
npm run build           # JSDoc site into build/, open build/index.html in a browser
```

`npm test` globs `test/*.js` only, so nothing under `test/manual/` runs with it.

`index.d.ts` is generated from the cluster definitions and committed. Never edit it by hand; run
`npm run generate-types`, which CI does too.

There is no `CHANGELOG.md`. Release notes are generated from the titles of merged pull requests, so
the title of a pull request is what users end up reading, see
[Release notes](README.md#release-notes).

## Architecture

A Zigbee Cluster Library (ZCL) implementation for Homey's Zigbee stack.

```
in:   ZCLNode.handleFrame() -> Endpoint.handleFrame() -> Cluster/BoundCluster.handleFrame()
out:  generated command method -> Cluster.sendFrame() -> Endpoint.sendFrame() -> ZCLNode.sendFrame()
```

`ZCLNode` (`lib/Node.js`) wraps Homey's ZigBeeNode and owns the endpoints. An `Endpoint`
(`lib/Endpoint.js`) holds both `clusters`, the client side that sends commands, and `bindings`, the
server side that receives them. `Cluster` (`lib/Cluster.js`) turns every entry in a cluster's
`COMMANDS` into a prototype method through `_addPrototypeMethods`, which is why cluster definitions
are plain data rather than code, and why no `sendCommand` method exists to grep for.
`BoundCluster` (`lib/BoundCluster.js`) is the server counterpart.

Cluster definitions live in `lib/clusters/*.js`, register themselves with `Cluster.addCluster()` and
are re-exported from `lib/clusters/index.js` together with the `CLUSTER` constant. Adding or
updating one is described in [docs/adding-clusters.md](docs/adding-clusters.md).

Refer to a cluster id as `OnOffCluster.ID`, never as `6` or `0x0006`.

## Tests

Tests run on `node:test`, so `describe`, `it` and `mock` are imported, not globals. A callback-style
test takes the test context first: `it('...', function (t, done) { ... })`. Written as
`function (done)` node:test sees a synchronous test, passes it immediately and never runs the
assertions.

Build mock nodes with the helpers in `test/util/index.js` instead of by hand:

- `createMockNode({ loopback: true, ... })` sends a command straight back into the same node's
  `BoundCluster`, which covers most cases. See `test/onOff.js`.
- `createConnectedNodePair()` wires two nodes together when sender and receiver must differ. See
  `test/testNode.js`.
- `MOCK_DEVICES` holds preset sensors. See `test/iasZone.js`.

Server-to-client traffic such as attribute reports and notifications has no helper at the time of
writing, so check `test/util/index.js` first and otherwise build a `ZCLStandardHeader` by hand and
pass it to `node.handleFrame()`, as `test/attributeReport.js` does.
