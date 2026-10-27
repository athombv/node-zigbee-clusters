'use strict';

const Node = require('../../lib/Node');
const Endpoint = require('../../lib/Endpoint');
const BoundCluster = require('../../lib/BoundCluster');
const { createBoundClusterWithAttributes } = require('./mockNode');

// Homey's Zigbee stack rejects a longer ZCL frame (MAX_ZCL_BYTES in @athombv/z3gateway).
const HOMEY_MAX_ZCL_BYTES = 82;

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
 * `zclNode` is the node under test, as a driver gets it in `onNodeInit`. `virtualDevice` sends commands
 * through `virtualDevice.endpoints[n].clusters` and any other frame, such as an attribute report, with
 * `virtualDevice.sendFrame(endpointId, clusterId, buffer)`. An interceptor sees each frame before
 * delivery and returns `undefined` to pass it, `null` to drop it, or one or more buffers to
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
    async sendFrame(endpointId, clusterId, data) {
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

      for (const raw of raws) {
        const record = { from, endpointId, clusterId, raw };
        frames.push(record);
        const delivery = (async () => {
          // Parsed here, not up front: a malformed frame must reach the receiver as it is.
          record.frame = Endpoint.parseFrame(raw);
          await nodes[to].handleFrame(endpointId, clusterId, raw);
        })()
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
        cluster instanceof BoundCluster ? cluster : createBoundClusterWithAttributes(cluster),
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
