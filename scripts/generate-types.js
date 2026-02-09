'use strict';

/* eslint-disable no-console, global-require */

/**
 * Type generation script for zigbee-clusters
 * Loads cluster modules directly and generates TypeScript interfaces
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../index.d.ts');

/**
 * Convert a ZCLDataType object to TypeScript type string
 * @param {object} dataType - ZCLDataType object with shortName and args
 * @returns {string} TypeScript type string
 */
function zclTypeToTS(dataType) {
  if (!dataType || !dataType.shortName) return 'unknown';

  const { shortName, args } = dataType;

  // No data
  if (shortName === 'noData') return 'null';

  // Boolean
  if (shortName === 'bool') return 'boolean';

  // Numeric types
  if (/^u?int\d+$/.test(shortName)) return 'number';
  // data8-32 use readUIntBE, return number
  if (/^data(8|16|24|32)$/.test(shortName)) return 'number';
  // data40-64 use buf.slice, return Buffer
  if (/^data(40|48|56|64)$/.test(shortName)) return 'Buffer';
  // Float types
  if (shortName === 'single' || shortName === 'double') return 'number';

  // String types
  if (shortName === 'string' || shortName === '_FixedString') return 'string';
  // EUI addresses return colon-separated hex strings
  if (shortName === 'EUI64' || shortName === 'EUI48') return 'string';
  // key128 returns colon-separated hex string
  if (shortName === 'key128') return 'string';

  // Buffer types
  if (shortName === 'octstr' || shortName === '_buffer' || shortName === '_buffer8' || shortName === '_buffer16') {
    return 'Buffer';
  }

  // Enum types - extract keys from args[0]
  if (/^enum(4|8|16|32)$/.test(shortName)) {
    if (args && args[0] && typeof args[0] === 'object') {
      const keys = Object.keys(args[0]);
      if (keys.length > 0) {
        return keys.map(k => `'${k}'`).join(' | ');
      }
    }
    return 'number';
  }

  // Map/bitmap types - extract flag names from args
  if (/^map(4|\d+)$/.test(shortName)) {
    if (args && args.length > 0) {
      const flags = args.filter(a => typeof a === 'string');
      if (flags.length > 0) {
        return `Partial<{ ${flags.map(f => `${f}: boolean`).join('; ')} }>`;
      }
    }
    return 'Partial<Record<string, boolean>>';
  }

  // Array types (note: shortName has underscore prefix: _Array0, _Array8)
  // Recursively determine element type from args[0]
  if (/^_?Array(0|8|16)$/.test(shortName)) {
    if (args && args[0]) {
      const elementType = zclTypeToTS(args[0]);
      return `${elementType}[]`;
    }
    return 'unknown[]';
  }

  return 'unknown';
}

/**
 * Parse a cluster and extract its type information
 * @param {Function} ClusterClass - Cluster class with static ATTRIBUTES/COMMANDS
 * @returns {object} Cluster definition
 */
function parseCluster(ClusterClass) {
  const clusterName = ClusterClass.NAME;
  const clusterId = ClusterClass.ID;
  const attributes = [];
  const commands = [];

  // Parse attributes
  const attrs = ClusterClass.ATTRIBUTES || {};
  for (const [name, def] of Object.entries(attrs)) {
    if (def && def.type) {
      attributes.push({
        name,
        tsType: zclTypeToTS(def.type),
      });
    }
  }

  // Parse commands
  const cmds = ClusterClass.COMMANDS || {};
  for (const [name, def] of Object.entries(cmds)) {
    const cmdArgs = [];
    if (def && def.args) {
      for (const [argName, argType] of Object.entries(def.args)) {
        cmdArgs.push({
          name: argName,
          tsType: zclTypeToTS(argType),
        });
      }
    }
    commands.push({ name, args: cmdArgs });
  }

  return {
    clusterName, clusterId, attributes, commands,
  };
}

/**
 * Convert cluster name to PascalCase interface name
 * @param {string} clusterName
 * @returns {string}
 */
function toInterfaceName(clusterName) {
  const name = clusterName.charAt(0).toUpperCase() + clusterName.slice(1);
  return `${name}Cluster`;
}

/**
 * Generate TypeScript interface for a cluster
 * @param {object} cluster - Parsed cluster definition
 * @returns {string} TypeScript interface code
 */
function generateClusterInterface(cluster) {
  const interfaceName = toInterfaceName(cluster.clusterName);
  const lines = [];

  // Generate attributes interface
  if (cluster.attributes.length > 0) {
    lines.push(`export interface ${interfaceName}Attributes {`);
    for (const attr of cluster.attributes) {
      lines.push(`  ${attr.name}?: ${attr.tsType};`);
    }
    lines.push('}');
    lines.push('');
  }

  // Generate cluster interface
  lines.push(`export interface ${interfaceName} extends ZCLNodeCluster {`);

  // Add typed readAttributes if we have attributes
  if (cluster.attributes.length > 0) {
    const attrNames = cluster.attributes.map(a => `'${a.name}'`).join(' | ');
    lines.push(`  readAttributes<K extends ${attrNames}>(attributeNames: K[], opts?: { timeout?: number }): Promise<Pick<${interfaceName}Attributes, K>>;`);
    lines.push(`  writeAttributes(attributes: Partial<${interfaceName}Attributes>): Promise<void>;`);
  }

  // Add command methods
  for (const cmd of cluster.commands) {
    if (cmd.args.length > 0) {
      // Buffer arguments are optional - ZCL allows empty octet strings
      const argsType = `{ ${cmd.args.map(a => `${a.name}${a.tsType === 'Buffer' ? '?' : ''}: ${a.tsType}`).join('; ')} }`;
      lines.push(`  ${cmd.name}(args: ${argsType}): Promise<void>;`);
    } else {
      lines.push(`  ${cmd.name}(): Promise<void>;`);
    }
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate the full index.d.ts file
 * @param {object[]} clusters - Array of parsed cluster definitions
 * @returns {string} Complete TypeScript definitions file
 */
function generateTypesFile(clusters) {
  const lines = [];

  // Header
  lines.push('// Auto-generated TypeScript definitions for zigbee-clusters');
  lines.push('// Generated by scripts/generate-types.js');
  lines.push('');
  lines.push('import * as EventEmitter from "events";');
  lines.push('');

  // Base types
  lines.push(`type EndpointDescriptor = {
  endpointId: number;
  inputClusters: number[];
  outputClusters: number[];
};

type ConstructorOptions = {
  endpointDescriptors: EndpointDescriptor[];
  sendFrame: (endpointId: number, clusterId: number, frame: Buffer) => Promise<void>;
};
`);

  // Base ZCLNodeCluster interface
  lines.push(`export interface ZCLNodeCluster extends EventEmitter {
  /**
   * Command which requests the remote cluster to report its generated commands.
   */
  discoverCommandsGenerated(opts?: {
    startValue?: number;
    maxResults?: number;
  }): Promise<number[]>;

  /**
   * Command which requests the remote cluster to report its received commands.
   */
  discoverCommandsReceived(opts?: {
    startValue?: number;
    maxResults?: number;
  }): Promise<number[]>;

  /**
   * Command which reads a given set of attributes from the remote cluster.
   */
  readAttributes(
    attributeNames: string[],
    opts?: { timeout?: number }
  ): Promise<{ [x: string]: unknown }>;

  /**
   * Command which writes a given set of attribute key-value pairs to the remote cluster.
   */
  writeAttributes(attributes?: object): Promise<void>;

  /**
   * Command which configures attribute reporting for the given attributes on the remote cluster.
   */
  configureReporting(attributes?: object): Promise<void>;

  /**
   * Command which retrieves the reporting configurations for the given attributes.
   */
  readReportingConfiguration(attributes?: (string | number)[]): Promise<{
    status: string;
    direction: 'reported' | 'received';
    attributeId: number;
    attributeDataType?: number;
    minInterval?: number;
    maxInterval?: number;
    minChange?: number;
    timeoutPeriod?: number;
  }[]>;

  /**
   * Command which discovers the implemented attributes on the remote cluster.
   */
  discoverAttributes(): Promise<(string | number)[]>;

  /**
   * Command which discovers the implemented attributes with access control info.
   */
  discoverAttributesExtended(): Promise<{
    name?: string;
    id: number;
    acl: { readable: boolean; writable: boolean; reportable: boolean };
  }[]>;
}
`);

  // Generate individual cluster interfaces
  for (const cluster of clusters) {
    lines.push(generateClusterInterface(cluster));
    lines.push('');
  }

  // Generate cluster registry type
  lines.push('/** Type-safe cluster registry */');
  lines.push('export interface ClusterRegistry {');
  for (const cluster of clusters) {
    const interfaceName = toInterfaceName(cluster.clusterName);
    lines.push(`  ${cluster.clusterName}?: ${interfaceName};`);
  }
  lines.push('}');
  lines.push('');

  // Generate endpoint type
  lines.push(`export type ZCLNodeEndpoint = {
  clusters: ClusterRegistry & {
    [clusterName: string]: ZCLNodeCluster | undefined;
  };
};

export interface ZCLNode {
  endpoints: { [endpointId: number | string]: ZCLNodeEndpoint };
  handleFrame: (
    endpointId: number,
    clusterId: number,
    frame: Buffer,
    meta?: unknown
  ) => Promise<void>;
}
`);

  // Module declaration for CommonJS compatibility
  lines.push(`declare module "zigbee-clusters" {
  export const ZCLNode: {
    new (options: ConstructorOptions): ZCLNode;
  };
  export const CLUSTER: {
    [key: string]: { ID: number; NAME: string; ATTRIBUTES: unknown; COMMANDS: unknown };
  };
  export { ZCLNodeCluster };`);

  // Export all cluster classes
  for (const cluster of clusters) {
    const interfaceName = toInterfaceName(cluster.clusterName);
    lines.push(`  export const ${interfaceName}: ${interfaceName};`);
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Main entry point
 */
function main() {
  console.log('Loading cluster modules...');

  // Load all clusters via the index
  const clustersModule = require('../lib/clusters');
  const clusters = [];

  // Get all exported cluster classes (end with 'Cluster')
  for (const [name, value] of Object.entries(clustersModule)) {
    if (name.endsWith('Cluster') && typeof value === 'function' && value.NAME) {
      try {
        const cluster = parseCluster(value);
        clusters.push(cluster);
        console.log(`  ✓ ${cluster.clusterName} (${cluster.attributes.length} attrs, ${cluster.commands.length} cmds)`);
      } catch (err) {
        console.warn(`  ✗ Failed to parse ${name}: ${err.message}`);
      }
    }
  }

  // Sort clusters alphabetically
  clusters.sort((a, b) => a.clusterName.localeCompare(b.clusterName));

  console.log(`\nGenerating ${OUTPUT_FILE}...`);
  const output = generateTypesFile(clusters);
  fs.writeFileSync(OUTPUT_FILE, output);

  console.log(`Done! Generated types for ${clusters.length} clusters.`);
}

main();
