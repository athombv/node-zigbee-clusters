'use strict';

const Node = require('../../lib/Node');
const BoundCluster = require('../../lib/BoundCluster');

// Load all clusters so they can be bound
require('../../lib/clusters/basic');
require('../../lib/clusters/powerConfiguration');
require('../../lib/clusters/iasZone');
require('../../lib/clusters/temperatureMeasurement');
require('../../lib/clusters/relativeHumidity');
require('../../lib/clusters/onOff');
require('../../lib/clusters/metering');
require('../../lib/clusters/electricalMeasurement');

/**
 * Creates a BoundCluster with getter properties for each attribute.
 *
 * @param {Object} attributes - Attribute name/value pairs
 * @returns {BoundCluster} Configured BoundCluster
 */
function createBoundClusterWithAttributes(attributes) {
  const ClusterClass = class extends BoundCluster {

    constructor() {
      super();
      // Store mutable attributes
      this._attributes = { ...attributes };
    }

  };

  // Define getters/setters for each attribute
  Object.keys(attributes).forEach(attrName => {
    Object.defineProperty(ClusterClass.prototype, attrName, {
      get() {
        return this._attributes[attrName];
      },
      set(value) {
        this._attributes[attrName] = value;
      },
      enumerable: true,
      configurable: true,
    });
  });

  return new ClusterClass();
}

/**
 * Creates a mock device Node with configurable cluster attributes.
 *
 * @example
 * const mockMotionSensor = createMockDevice({
 *   endpoints: [{
 *     endpointId: 1,
 *     inputClusters: [0x0000, 0x0001, 0x0500],
 *     clusters: {
 *       iasZone: {
 *         zoneType: 0x000D, // Motion sensor
 *         zoneState: 1,    // Enrolled
 *         zoneStatus: 0,
 *       },
 *       powerConfiguration: {
 *         batteryPercentageRemaining: 180, // 90%
 *       },
 *     },
 *   }],
 * });
 *
 * @param {Object} config - Device configuration
 * @param {Array} config.endpoints - Endpoint configurations
 * @param {number} config.endpoints[].endpointId - Endpoint ID
 * @param {number[]} config.endpoints[].inputClusters - Input cluster IDs
 * @param {number[]} [config.endpoints[].outputClusters] - Output cluster IDs
 * @param {Object} [config.endpoints[].clusters] - Cluster attribute values keyed by cluster name
 * @returns {Node} Configured mock Node
 */
function createMockDevice(config) {
  const endpointDescriptors = config.endpoints.map(ep => ({
    endpointId: ep.endpointId,
    inputClusters: ep.inputClusters || [],
    outputClusters: ep.outputClusters || [],
  }));

  const mockNode = {
    sendFrame: () => Promise.resolve(), // No-op by default
    endpointDescriptors,
  };

  const node = new Node(mockNode);

  // Bind clusters with preset attribute values
  config.endpoints.forEach(ep => {
    if (!ep.clusters) return;

    Object.entries(ep.clusters).forEach(([clusterName, attributes]) => {
      const boundCluster = createBoundClusterWithAttributes(attributes);
      node.endpoints[ep.endpointId].bind(clusterName, boundCluster);
    });
  });

  return node;
}

/**
 * Preset device configurations for common device types.
 */
const MOCK_DEVICES = {
  /**
   * IAS Zone Motion Sensor
   */
  motionSensor: (overrides = {}) => createMockDevice({
    endpoints: [{
      endpointId: 1,
      inputClusters: [0x0000, 0x0001, 0x0500],
      clusters: {
        basic: {
          zclVersion: 3,
          manufacturerName: 'MockDevice',
          modelId: 'MockMotionSensor',
          ...overrides.basic,
        },
        powerConfiguration: {
          batteryPercentageRemaining: 200, // 100%
          ...overrides.powerConfiguration,
        },
        iasZone: {
          zoneState: 1, // Enrolled
          zoneType: 0x000D, // Motion sensor
          zoneStatus: 0,
          iasCIEAddress: '0x0000000000000000',
          zoneId: 1,
          ...overrides.iasZone,
        },
      },
    }],
  }),

  /**
   * IAS Zone Contact Sensor (door/window)
   */
  contactSensor: (overrides = {}) => createMockDevice({
    endpoints: [{
      endpointId: 1,
      inputClusters: [0x0000, 0x0001, 0x0500],
      clusters: {
        basic: {
          zclVersion: 3,
          manufacturerName: 'MockDevice',
          modelId: 'MockContactSensor',
          ...overrides.basic,
        },
        powerConfiguration: {
          batteryPercentageRemaining: 200,
          ...overrides.powerConfiguration,
        },
        iasZone: {
          zoneState: 1,
          zoneType: 0x0015, // Contact switch
          zoneStatus: 0,
          iasCIEAddress: '0x0000000000000000',
          zoneId: 1,
          ...overrides.iasZone,
        },
      },
    }],
  }),

  /**
   * Temperature + Humidity Sensor
   */
  tempHumiditySensor: (overrides = {}) => createMockDevice({
    endpoints: [{
      endpointId: 1,
      inputClusters: [0x0000, 0x0001, 0x0402, 0x0405],
      clusters: {
        basic: {
          zclVersion: 3,
          manufacturerName: 'MockDevice',
          modelId: 'MockTempHumidity',
          ...overrides.basic,
        },
        powerConfiguration: {
          batteryPercentageRemaining: 200,
          ...overrides.powerConfiguration,
        },
        temperatureMeasurement: {
          measuredValue: 2150, // 21.50°C
          minMeasuredValue: -4000,
          maxMeasuredValue: 8500,
          ...overrides.temperatureMeasurement,
        },
        relativeHumidity: {
          measuredValue: 6500, // 65.00%
          minMeasuredValue: 0,
          maxMeasuredValue: 10000,
          ...overrides.relativeHumidity,
        },
      },
    }],
  }),

  /**
   * Smart Plug with Power Metering
   */
  smartPlug: (overrides = {}) => createMockDevice({
    endpoints: [{
      endpointId: 1,
      inputClusters: [0x0000, 0x0006, 0x0702, 0x0B04],
      clusters: {
        basic: {
          zclVersion: 3,
          manufacturerName: 'MockDevice',
          modelId: 'MockSmartPlug',
          ...overrides.basic,
        },
        onOff: {
          onOff: false,
          ...overrides.onOff,
        },
        metering: {
          currentSummationDelivered: 12345678,
          multiplier: 1,
          divisor: 1000,
          ...overrides.metering,
        },
        electricalMeasurement: {
          activePower: 1500, // 150.0W
          rmsVoltage: 2300, // 230.0V
          rmsCurrent: 652, // 0.652A
          ...overrides.electricalMeasurement,
        },
      },
    }],
  }),
};

module.exports = {
  createMockDevice,
  createBoundClusterWithAttributes,
  MOCK_DEVICES,
};
