'use strict';

// Taken before a test can mock timers: delivery must not stop when a test fakes time.
const { setImmediate } = require('node:timers');

const Node = require('../../lib/Node');
const Endpoint = require('../../lib/Endpoint');
const BoundCluster = require('../../lib/BoundCluster');
const { ZCLStandardHeader } = require('../../lib/zclFrames');
const { MAX_ZCL_FRAME_BYTES } = require('../../lib/constants');

// ponytail: counts every frame of a device, raise it when a legit test (e.g. an OTA transfer)
// sends more
const MAX_FRAMES = 1000;

/** A BoundCluster serving `attributes`: reads return them, writes replace them. */
function boundClusterWithAttributes(attributes) {
  const values = { ...attributes };
  const bound = new BoundCluster();
  // Accessors: writeAttributes treats a field without a setter as read-only.
  for (const name of Object.keys(values)) {
    Object.defineProperty(bound, name, {
      get: () => values[name],
      set: (value) => {
        values[name] = value;
      },
      enumerable: true,
    });
  }
  return bound;
}

/**
 * Creates the node under test (`zclNode`) and a scripted device (`virtualDevice`), linked in
 * memory. docs/testing.md explains the idea.
 *
 * @param {object} config
 * @param {object[]} config.endpoints - The device's endpoints as its descriptors list them
 *   (`endpointId`, `inputClusters`, `outputClusters`), plus `clusters`: per cluster name, attribute
 *   values or a `BoundCluster` that serves it.
 * @param {number} [config.maxFrameSize] - Longest frame `zclNode` may send.
 * @returns {object} `zclNode` and `virtualDevice`; `frames`, every frame sent as `{ from,
 *   endpointId, clusterId, frame, raw }`; `intercept(fn)`, where `fn(record)` returns `undefined`
 *   to pass a frame, `null` to drop it or buffers to send instead, and throwing fails the sender's
 *   `sendFrame`; `settle()`, which waits until no frame is in flight and rejects when a delivery
 *   failed.
 */
function createVirtualDevice({ endpoints, maxFrameSize = MAX_ZCL_FRAME_BYTES }) {
  const frames = [];
  const interceptors = [];
  const inFlight = new Set();
  const nodes = {};
  let failure;

  const link = (from, to) => ({
    endpointDescriptors: endpoints.map((ep) => ({
      endpointId: ep.endpointId,
      inputClusters: ep.inputClusters || [],
      outputClusters: ep.outputClusters || [],
    })),
    async sendFrame(endpointId, clusterId, data, meta) {
      if (frames.length >= MAX_FRAMES) {
        // The node sending this may swallow the error, so settle() rethrows it.
        failure = failure || new Error(`More than ${MAX_FRAMES} frames, are the nodes in a loop?`);
        throw failure;
      }
      if (from === 'zclNode' && data.length > maxFrameSize) {
        throw new Error(`ZCL frame too long, got ${data.length} bytes, max: ${maxFrameSize}.`);
      }

      let raws = [data];
      for (const interceptor of interceptors) {
        raws = raws.flatMap((raw) => {
          const result = interceptor({
            from,
            endpointId,
            clusterId,
            frame: Endpoint.parseFrame(raw),
            raw,
          });
          if (result === undefined) return [raw];
          if (result === null) return [];
          return result;
        });
      }
      if (!raws.every(Buffer.isBuffer)) throw new TypeError('An interceptor returned a non-Buffer');

      for (const raw of raws) {
        frames.push({ from, endpointId, clusterId, frame: Endpoint.parseFrame(raw), raw });
        // Delivered after sendFrame resolves, as on Homey where sendFrame resolves on the APS ACK
        // and the response comes later, so a command's response timeout really runs.
        const delivery = new Promise((resolve) => setImmediate(resolve))
          .then(() => nodes[to].handleFrame(endpointId, clusterId, raw, meta))
          .catch((err) => {
            failure = failure || err;
          })
          .finally(() => inFlight.delete(delivery));
        inFlight.add(delivery);
      }
    },
  });

  nodes.zclNode = new Node(link('zclNode', 'virtualDevice'));

  // The device sends commands on its output clusters, so those get a Cluster on its side.
  const virtualDeviceLink = link('virtualDevice', 'zclNode');
  virtualDeviceLink.endpointDescriptors = virtualDeviceLink.endpointDescriptors.map((ep) => ({
    ...ep,
    inputClusters: ep.outputClusters,
  }));
  nodes.virtualDevice = new Node(virtualDeviceLink);

  endpoints.forEach((ep) => {
    Object.entries(ep.clusters || {}).forEach(([clusterName, cluster]) => {
      nodes.virtualDevice.endpoints[ep.endpointId].bind(
        clusterName,
        cluster instanceof BoundCluster ? cluster : boundClusterWithAttributes(cluster),
      );
    });
  });

  return {
    zclNode: nodes.zclNode,
    virtualDevice: nodes.virtualDevice,
    frames,
    intercept: (interceptor) => interceptors.push(interceptor),
    async settle() {
      while (inFlight.size) await Promise.all(inFlight);
      if (failure) throw failure;
    },
  };
}

/** A device with endpoint 1 serving `ClusterClass`, by `bound` when given. */
function createSingleClusterDevice(ClusterClass, bound) {
  return createVirtualDevice({
    endpoints: [
      {
        endpointId: 1,
        inputClusters: [ClusterClass.ID],
        clusters: bound ? { [ClusterClass.NAME]: bound } : {},
      },
    ],
  });
}

/** A server-to-client frame, as a device sends a report or a notification. */
function frameToClient({
  cmdId,
  data = Buffer.alloc(0),
  clusterSpecific = false,
  trxSequenceNumber = 0,
  disableDefaultResponse = false,
}) {
  const header = new ZCLStandardHeader();
  header.frameControl.directionToClient = true;
  header.frameControl.clusterSpecific = clusterSpecific;
  header.frameControl.disableDefaultResponse = disableDefaultResponse;
  header.trxSequenceNumber = trxSequenceNumber;
  header.cmdId = cmdId;
  header.data = data;
  return header.toBuffer();
}

module.exports = { createVirtualDevice, createSingleClusterDevice, frameToClient };
