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

`npm test` globs `test/*.js` only, so a test file must sit directly in `test/`; `test/util/` holds
the harness.

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

Tests run on `node:test`, so `describe`, `it` and `mock` are imported, not globals.

Every test that needs a node uses `createVirtualDevice()` from `test/util`: the code under test
(`zclNode`) and a scripted device (`virtualDevice`) on two nodes, with an in-memory link that logs
every frame (`frames`), can drop or rewrite them (`intercept`) and waits for them (`settle`). Read
[docs/testing.md](docs/testing.md) before writing a test. The rules that matter most:

- Never assert inside a `BoundCluster` or cluster handler: the endpoint turns the thrown assertion
  into an error Default Response. Store what the handler received, assert after the `await`.
- No `done` callbacks; `await settle()` before asserting that something did not happen.
- Assert on the bytes in `frames` when the encoding is the point, not on a round trip through the
  same definition.
- A known bug is a test with `{ todo: '...' }`; check it fails on the bug, not on the test.
