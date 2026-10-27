# Writing tests

Every test that needs a node uses `createVirtualDevice()` from `test/util/virtualDevice.js`. It puts
the code under test and a scripted device on two nodes, linked in memory. No Homey, no radio.

- `zclNode` is the node under test, a `ZCLNode` as a driver gets it. Its `endpoints[n].clusters`
  talk to the device; `endpoints[n].bind()` serves what the device sends, such as OTA requests.
- `virtualDevice` is a second `ZCLNode` playing the device: `BoundCluster`s for its input clusters,
  `clusters` for its output clusters.

Both run the library's real encoding, parsing and response matching. As on Homey, `sendFrame`
resolves before the other side sees the frame, so response timeouts run.

```js
const { createVirtualDevice } = require('./util/virtualDevice');

it('reads the on/off state', async function () {
  const { zclNode } = createVirtualDevice({
    endpoints: [
      { endpointId: 1, inputClusters: [OnOffCluster.ID], clusters: { onOff: { onOff: true } } },
    ],
  });

  const result = await zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);

  assert.deepStrictEqual(result, { onOff: true });
});
```

## Reference

`createVirtualDevice({ endpoints, maxFrameSize })`:

- `endpoints[]`: `endpointId`, `inputClusters`, `outputClusters` as the device's descriptors, and
  `clusters` keyed by name: attribute values (readable and writable) or your own `BoundCluster`.
- `maxFrameSize`: longest frame `zclNode` may send, default 82 bytes as Homey's stack.

It returns:

- `zclNode`, `virtualDevice`. `virtualDevice.sendFrame(endpointId, clusterId, buffer, meta)` sends a
  raw frame; `meta` is what the stack passes, such as `{ groupId }` or `{ broadcast: true }`.
- `frames`: every frame sent, as `{ from, endpointId, clusterId, frame, raw }`, where `from` is
  `'zclNode'` or `'virtualDevice'` and `frame` the parsed header.
- `intercept(fn)`: `fn(record)` returns `undefined` to pass a frame, `null` to drop it, or buffers to
  deliver instead. Throwing makes the sender's `sendFrame` reject.
- `settle()`: waits until no frame is in flight. Rejects when a delivery failed, or after 1000
  frames, which means the nodes are answering each other in a loop.

Also exported: `createSingleClusterDevice(OnOffCluster, boundCluster)` for one endpoint with one
cluster, and `frameToClient({ cmdId, data, clusterSpecific, ... })` for a report or notification.

## Recipes

**A device that never answers:**

```js
t.mock.timers.enable({ apis: ['setTimeout'] });
intercept(({ from }) => (from === 'virtualDevice' ? null : undefined));
const read = zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);
await settle();
t.mock.timers.tick(10_000);
await assert.rejects(read, /Timeout/);
```

**A frame reusing the pending TSN, before the real reply:**

```js
intercept(({ from, frame, raw }) =>
  from === 'virtualDevice' ? [reportWithTsn(frame.trxSequenceNumber), raw] : undefined,
);
```

**Homey serving the device** (OTA, a remote's commands): put the cluster in the device's
`outputClusters`, bind on `zclNode`, send from `virtualDevice.endpoints[n].clusters`. See
`test/ota.js`.

**A known bug:** a test for the correct behavior marked `{ todo: '...' }`; the fix removes the
`todo`. Check it fails on the bug, not on the test. See `test/virtualDevice.js`.

## Rules

- **Never assert inside a handler.** The endpoint turns the thrown assertion into an error Default
  Response. Store what the handler got, assert after the `await`.
- **No `done` callbacks.** Await the command or `settle()`.
- **`await settle()`** before asserting that something did not happen, or on what a frame from the
  device triggered.
- **Fake time** with `t.mock.timers`; response timeouts default to 10 seconds.
- **One device per test**, created inside the `it`.
- **Assert specific errors and real bytes.** A round trip through the same definition passes when
  the definition is wrong; compare `frames[i].raw` against the spec, as `test/colorControl.js` does.
- **Prove the failure path.** Break the library code under test and check the test fails.

## Known gaps

Interceptors run before delivery, so "deliver, then reject `sendFrame`" or "resolve `sendFrame`
late" need a stub on top, see `test/testClusterResponseTimeout.js`.
