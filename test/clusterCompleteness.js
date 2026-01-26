'use strict';

const assert = require('assert');
const { ZCL_SPEC, verifyClusterAttributes } = require('./util');

// Load all clusters so they can be verified
require('../lib/clusters/metering');
require('../lib/clusters/thermostat');
require('../lib/clusters/windowCovering');
require('../lib/clusters/doorLock');
require('../lib/clusters/temperatureMeasurement');
require('../lib/clusters/relativeHumidity');
require('../lib/clusters/occupancySensing');
require('../lib/clusters/powerConfiguration');
require('../lib/clusters/iasZone');

describe('Cluster Completeness Tests', function() {
  describe('Metering Cluster (0x0702)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('metering');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });

    it('should have critical formatting attributes', function() {
      const result = verifyClusterAttributes('metering');
      const criticalAttrs = ['unitOfMeasure', 'summationFormatting', 'meteringDeviceType'];
      for (const attr of criticalAttrs) {
        assert(
          result.implemented.includes(attr),
          `Critical attribute ${attr} should be implemented`,
        );
      }
    });
  });

  describe('Thermostat Cluster (0x0201)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('thermostat');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });

    it('should have setpoint attributes', function() {
      const result = verifyClusterAttributes('thermostat');
      const setpointAttrs = ['occupiedCoolingSetpoint', 'occupiedHeatingSetpoint'];
      for (const attr of setpointAttrs) {
        assert(
          result.implemented.includes(attr),
          `Setpoint attribute ${attr} should be implemented`,
        );
      }
    });
  });

  describe('Window Covering Cluster (0x0102)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('windowCovering');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });

    it('should have position percentage attributes', function() {
      const result = verifyClusterAttributes('windowCovering');
      const positionAttrs = ['currentPositionLiftPercentage', 'currentPositionTiltPercentage'];
      for (const attr of positionAttrs) {
        assert(
          result.implemented.includes(attr),
          `Position attribute ${attr} should be implemented`,
        );
      }
    });
  });

  describe('Door Lock Cluster (0x0101)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('doorLock');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });

    it('should have lock state and type attributes', function() {
      const result = verifyClusterAttributes('doorLock');
      const lockAttrs = ['lockState', 'lockType', 'actuatorEnabled'];
      for (const attr of lockAttrs) {
        assert(
          result.implemented.includes(attr),
          `Lock attribute ${attr} should be implemented`,
        );
      }
    });
  });

  describe('Temperature Measurement Cluster (0x0402)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('temperatureMeasurement');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });
  });

  describe('Relative Humidity Cluster (0x0405)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('relativeHumidity');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });
  });

  describe('Occupancy Sensing Cluster (0x0406)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('occupancySensing');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });
  });

  describe('Power Configuration Cluster (0x0001)', function() {
    it('should have battery attributes', function() {
      const result = verifyClusterAttributes('powerConfiguration');
      // Power Configuration has no mandatory attributes per ZCL spec
      // But we want to ensure battery-related attributes are present
      const batteryAttrs = ['batteryVoltage', 'batteryPercentageRemaining'];
      for (const attr of batteryAttrs) {
        assert(
          result.implemented.includes(attr),
          `Battery attribute ${attr} should be implemented`,
        );
      }
    });
  });

  describe('IAS Zone Cluster (0x0500)', function() {
    it('should have all mandatory attributes', function() {
      const result = verifyClusterAttributes('iasZone');
      assert.strictEqual(
        result.status,
        'pass',
        `Missing mandatory attributes: ${result.missing.join(', ')}`,
      );
    });
  });

  describe('All Spec Clusters Summary', function() {
    it('should report completeness for all clusters in ZCL_SPEC', function() {
      const results = {};
      const clusterNames = Object.keys(ZCL_SPEC);

      for (const name of clusterNames) {
        try {
          results[name] = verifyClusterAttributes(name);
        } catch (err) {
          results[name] = { status: 'error', error: err.message };
        }
      }

      // All clusters in spec should be complete
      const failures = Object.entries(results).filter(
        ([, r]) => r.status === 'fail' || r.status === 'error',
      );
      assert.strictEqual(
        failures.length,
        0,
        `Incomplete clusters: ${failures.map(([n]) => n).join(', ')}`,
      );
    });
  });
});
