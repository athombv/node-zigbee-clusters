# Writing tests

Every test that needs a node uses one harness, `createVirtualDevice()` from
`test/util/virtualDevice.js`. It puts the code under test and a scripted Zigbee device on two
separate nodes, connected by an in-memory link that records every frame. No Homey and no radio are
involved, so the whole suite runs in well under a second. See
[Contributing](../README.md#contributing) for the checks every pull request has to pass.

## The two sides

```
zclNode  <-- in-memory link: logs, intercepts, 82-byte limit -->  virtualDevice
(the code under test,                                               (the device it talks to,
 as a driver gets it in onNodeInit)                                  scripted by the test)
```

- `zclNode` is a `ZCLNode`, exactly what a Homey driver gets. Its `endpoints[n].clusters` are the
  client side that reads attributes and sends commands to the device; its `endpoints[n].bind()`
  serves what the device sends to Homey, such as a remote's commands or OTA requests.
- `virtualDevice` is a second `ZCLNode` that plays the device. Its endpoints serve the device's
  input clusters with `BoundCluster`s and, for its output clusters, have `clusters` to send commands
  to `zclNode`.

Both sides run the library's real frame parsing, encoding, response matching and default response
rules. Only the stack below `ZCLNode.sendFrame` is replaced. As on Homey, `sendFrame` resolves
before the other side sees the frame, so a command's response timeout runs for every command.

## Quick start

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

`createVirtualDevice({ endpoints, maxFrameSize })` describes the device as its descriptors would:

| Field                        | Meaning                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `endpoints[].endpointId`     | Endpoint id, used on both sides.                                           |
| `endpoints[].inputClusters`  | Server clusters of the device. `zclNode` gets a client `Cluster` for each. |
| `endpoints[].outputClusters` | Client clusters of the device. `virtualDevice` gets a `Cluster` for each.  |
| `endpoints[].clusters`       | Per cluster name, attribute values or a `BoundCluster` instance.           |
| `maxFrameSize`               | Longest frame `zclNode` may send, default 82 bytes as Homey's stack.       |

Attribute values become a `BoundCluster` that answers reads and accepts writes. Pass your own
`BoundCluster` subclass to script commands or misbehave. A cluster can also be bound later with
`virtualDevice.endpoints[n].bind()`. For the common case of one endpoint with one cluster,
`createSingleClusterDevice(OnOffCluster, boundCluster)` is the short form.

It returns:

- `zclNode` and `virtualDevice`: the two nodes. `virtualDevice.sendFrame(endpointId, clusterId, buffer, meta)`
  sends any raw frame to `zclNode`; `meta` is what the stack would pass along, such as
  `{ groupId }` or `{ broadcast: true }`.
- `frames`: every frame sent over the link, in order, as `{ from, endpointId, clusterId, frame,
raw }`. `from` is `'zclNode'` or `'virtualDevice'` and `frame` the parsed header. Frames an
  interceptor dropped are not in it.
- `intercept(fn)`: `fn(record)` sees each frame before delivery and returns `undefined` to pass it,
  `null` to drop it, or a buffer or array of buffers to deliver instead. Throwing makes the sender's
  `sendFrame` reject, as a stack error does.
- `settle()`: resolves once every frame in flight, and each frame sent while handling one, has been
  handled. Work a handler or listener starts after an `await` of its own is not tracked. It rejects
  when a delivery failed, including when the nodes got stuck answering each other: the link refuses
  to send more than 1000 frames in total. Raise that cap in `test/util/virtualDevice.js` when a
  legit test, such as a long OTA transfer, needs more.

`frameToClient({ cmdId, data, clusterSpecific, trxSequenceNumber, disableDefaultResponse })` builds
the server-to-client frame a device sends as a report or notification.

## Recipes

**Assert on the wire, not on a round trip.** Encoding and decoding with the same definition passes
even when that definition is wrong. When the bytes matter, compare `frames[i].raw` or
`frames[i].frame` against the specification, as `test/colorControl.js` does.

**A device that misbehaves.** Override the handler on a `BoundCluster`, for example a read response
with ids that were not asked for:

```js
const onOff = new (class extends BoundCluster {
  async readAttributes() {
    const buf = Buffer.alloc(255);
    const records = [{ id: ON_TIME, status: 'SUCCESS', value: 5 }];
    const len = OnOffCluster.attributeArrayStatusDataType.toBuffer(buf, records, 0);
    return { attributes: buf.subarray(0, len) };
  }
})();
const { zclNode } = createVirtualDevice({
  endpoints: [{ endpointId: 1, inputClusters: [OnOffCluster.ID], clusters: { onOff } }],
});
```

**A device that never answers.** Drop its frames and advance the response timeout with mock timers:

```js
t.mock.timers.enable({ apis: ['setTimeout'] });
intercept(({ from }) => (from === 'virtualDevice' ? null : undefined));
const read = zclNode.endpoints[1].clusters.onOff.readAttributes(['onOff']);
await settle();
t.mock.timers.tick(10_000);
await assert.rejects(read, /Timeout/);
```

**Duplicate, colliding or rewritten frames.** Return more than one buffer from `intercept`. To have
the device send an unrelated frame with the pending TSN right before its reply:

```js
intercept(({ from, frame, raw }) =>
  from === 'virtualDevice' ? [reportWithTsn(frame.trxSequenceNumber), raw] : undefined,
);
```

**Something the device starts, such as a report or a notification.** Build the frame with
`frameToClient()`, send it with `virtualDevice.sendFrame()`, then `await settle()` before
asserting. See `test/attributeReport.js`.

**Homey serving the device.** For traffic the device starts, such as OTA requests or a remote's
commands, give the device the cluster as an output cluster, bind the `BoundCluster` on `zclNode`
and send from `virtualDevice.endpoints[n].clusters`. See `test/ota.js`.

**A known bug.** Write the test for the correct behavior and mark it
`{ todo: 'what is wrong, or the fixing PR' }`. It runs and reports, but does not fail the suite. The
fix removes the `todo`. Check in the output that a todo test fails on the bug itself and not on a
mistake in the test, because nothing else will tell you. See `test/virtualDevice.js`.

## Rules

- **Never assert inside a handler.** An error thrown in a `BoundCluster` or cluster handler is
  caught by the endpoint and turned into an error Default Response, so the assertion message is
  lost or the test passes anyway. Store what the handler received and assert after the `await`.
- **No `done` callbacks.** Await the command, or `settle()`, then assert. A `done` that is never
  called fails only after `npm test`'s 5 second timeout, and hangs a bare `node --test`.
- **`await settle()` before asserting that something did not happen**, and before asserting on
  anything a device-initiated frame triggers. Awaiting a command only waits for its own response.
- **Fake time, never wait.** Use `t.mock.timers` for response timeouts, which default to 10 seconds.
- **One device per test.** Create it inside the `it`, so no test depends on what an earlier one
  bound.
- **Assert specific errors.** `assert.rejects(promise, { message: 'UNSUPPORTED_CLUSTER' })`, not
  just that something threw.
- **Prove the failure path.** Break the library code the test is about and check the test fails.

## Known gaps

- The device has no typed way to send reports or server-to-client commands on its input clusters:
  `frameToClient()` builds the header, the payload bytes are written by hand.
- Interceptors run synchronously before delivery, so "deliver, then have `sendFrame` reject" or
  "resolve `sendFrame` late" need a stub on top of the harness, see
  `test/testClusterResponseTimeout.js`.
- `test/endpointStandalone.js` builds an `Endpoint` without a node on purpose and does not use the
  harness.
