# Writing tests

## The idea

A test plays both sides of a Zigbee conversation. `createVirtualDevice()` in
[`test/util/virtualDevice.js`](../test/util/virtualDevice.js) creates two nodes linked in memory:

- `zclNode`, the code under test, as a Homey driver gets it.
- `virtualDevice`, the device it talks to, scripted by the test with `BoundCluster`s.

Both run the library's real encoding, parsing and response matching; only the radio is replaced.
The link behaves like Homey's stack where it matters for this library: frames arrive after
`sendFrame` resolves, so response timeouts run, and `zclNode` cannot send more than 82 bytes. The
link also logs every frame and lets a test drop, rewrite or inject frames, which is how a test makes
a device misbehave in ways real hardware rarely does.

The options and return values are documented on the functions in
[`test/util/virtualDevice.js`](../test/util/virtualDevice.js).

## Examples

| To test                                                     | See                                  |
| ----------------------------------------------------------- | ------------------------------------ |
| A command or attribute read                                 | `test/onOff.js`                      |
| The bytes on the wire against the specification             | `test/colorControl.js`               |
| A report or notification from the device                    | `test/attributeReport.js`            |
| A device that answers wrongly, or never; known bugs as todo | `test/virtualDevice.js`              |
| Colliding TSNs, duplicate responses, failed sends           | `test/testClusterResponseTimeout.js` |
| Group and broadcast frames                                  | `test/testNode.js`                   |
| Homey serving the device, such as OTA                       | `test/ota.js`                        |
| A cluster with its own data type                            | `test/xiaomiLifeline.js`             |

## Rules

A test is only worth having if it fails when the code it covers breaks.

- **Never assert inside a handler.** The endpoint turns a thrown assertion into an error Default
  Response, so the test may pass anyway. Store what the handler got and assert after the `await`.
- **No `done` callbacks.** Await the command, or `settle()`.
- **`await settle()`** before asserting that something did not happen, or on what a frame from the
  device triggered.
- **Fake time** with `t.mock.timers`, never wait for a real timeout.
- **One device per test**, created inside the `it`.
- **Assert specific errors and real bytes.** A round trip through the same definition passes when
  the definition is wrong.
- **Prove the failure path.** Break the library code under test and check the test fails.
- **A known bug** is a test for the correct behavior marked `{ todo: '...' }`. Check it fails on the
  bug, not on the test; the fix removes the `todo`.
