'use strict';

const Node = require('../../lib/Node');
const Endpoint = require('../../lib/Endpoint');
const BoundCluster = require('../../lib/BoundCluster');

// Homey's Zigbee stack rejects a longer ZCL frame (MAX_ZCL_BYTES in @athombv/z3gateway).
const HOMEY_MAX_ZCL_BYTES = 82;

const MAX_FRAMES = 1000;

// A malformed frame is still delivered as it is, it just has no parsed form in the log.
function parse(raw) {
  try {
    return Endpoint.parseFrame(raw);
  } catch {
    return undefined;
  }
}

/** A BoundCluster serving `attributes`: reads return them, writes replace them. */
function boundClusterWithAttributes(attributes) {
  const values = { ...attributes };
  const bound = new BoundCluster();
  // Accessors, not plain fields: BoundCluster.writeAttributes treats a field without a setter as
  // read-only.
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
 * Creates a virtual device and the ZCLNode a driver would get for it, connected by an in-memory
 * link that records every frame and lets a test drop, rewrite or inject frames.
 *
 * @example
 * const { zclNode, virtualDevice, frames, intercept, settle } = createVirtualDevice({
 *   endpoints: [{
 *     endpointId: 1,
 *     inputClusters: [OnOffCluster.ID],
 *     clusters: { onOff: { onOff: true } },
 *   }],
 * });
 *
 * // The device never answers
 * intercept((frame) => (frame.from === 'virtualDevice' ? null : undefined));
 *
 * @param {Object} config
 * @param {Array} config.endpoints - As the device describes them: `endpointId`, `inputClusters`,
 * `outputClusters`, and `clusters` keyed by cluster name, each either attribute values or a
 * `BoundCluster` instance that scripts the device's behavior.
 * @param {number} [config.maxFrameSize] - Longest frame the zclNode may send, as the Homey stack.
 * @returns {{
 *   zclNode: Node,
 *   device: Node,
 *   frames: Array<{from: string, endpointId: number, clusterId: number, frame: Object, raw: Buffer, error?: Error}>,
 *   intercept: function(function(Object): (undefined|null|Buffer|Buffer[])): void,
 *   settle: function(): Promise<void>,
 * }}
 * `zclNode` is the node under test, as a driver gets it in `onNodeInit`. `virtualDevice` sends
 * commands through `virtualDevice.endpoints[n].clusters` and any other frame, such as an attribute
 * report, with `virtualDevice.sendFrame(endpointId, clusterId, buffer, meta)`, where `meta` is the
 * frame meta the stack would pass along. An interceptor sees each frame before delivery and returns `undefined` to pass it, `null` to drop it, or one or more buffers to
 * deliver instead; throwing fails the sender's `sendFrame` like a stack error. `settle` resolves
 * once every frame in flight, and the frames sent in reply, has been handled.
 */
function createVirtualDevice({ endpoints, maxFrameSize = HOMEY_MAX_ZCL_BYTES }) {
  const frames = [];
  const interceptors = [];
  const inFlight = new Set();
  const nodes = {};

  const link = (from, to) => ({
    endpointDescriptors: endpoints.map((ep) => ({
      endpointId: ep.endpointId,
      inputClusters: ep.inputClusters || [],
      outputClusters: ep.outputClusters || [],
    })),
    async sendFrame(endpointId, clusterId, data, meta) {
      // Breaks an endless request/response loop between the nodes, so the test fails, not hangs.
      if (frames.length >= MAX_FRAMES) {
        throw new Error(`More than ${MAX_FRAMES} frames sent, are the nodes stuck in a loop?`);
      }
      if (from === 'zclNode' && data.length > maxFrameSize) {
        throw new Error(`ZCL frame too long, got ${data.length} bytes, max: ${maxFrameSize}.`);
      }

      let raws = [data];
      for (const interceptor of interceptors) {
        raws = raws.flatMap((raw) => {
          const result = interceptor({ from, endpointId, clusterId, frame: parse(raw), raw });
          if (result === undefined) return [raw];
          if (result === null) return [];
          return result;
        });
      }

      for (const raw of raws) {
        const record = { from, endpointId, clusterId, frame: parse(raw), raw };
        frames.push(record);
        const delivery = nodes[to]
          .handleFrame(endpointId, clusterId, raw, meta)
          .catch((err) => {
            record.error = err;
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
    },
  };
}

module.exports = { createVirtualDevice, HOMEY_MAX_ZCL_BYTES };
