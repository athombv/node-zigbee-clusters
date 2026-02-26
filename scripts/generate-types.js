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
function parseCluster(ClusterClass, exportName) {
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
    const responseArgs = [];
    if (def && def.args) {
      for (const [argName, argType] of Object.entries(def.args)) {
        cmdArgs.push({
          name: argName,
          tsType: zclTypeToTS(argType),
        });
      }
    }
    // Parse response type if present
    if (def && def.response && def.response.args) {
      for (const [argName, argType] of Object.entries(def.response.args)) {
        responseArgs.push({
          name: argName,
          tsType: zclTypeToTS(argType),
        });
      }
    }
    commands.push({ name, args: cmdArgs, responseArgs });
  }

  return {
    exportName,
    clusterName,
    clusterId,
    attributes,
    commands,
  };
}

/**
 * Convert cluster name to PascalCase interface name
 * @param {string} clusterName
 * @returns {string}
 */
function toInterfaceName(cluster) {
  if (cluster.exportName) return cluster.exportName;
  const name = cluster.clusterName.charAt(0).toUpperCase() + cluster.clusterName.slice(1);
  return `${name}Cluster`;
}

/**
 * Generate TypeScript interface for a cluster
 * @param {object} cluster - Parsed cluster definition
 * @returns {string} TypeScript interface code
 */
function generateClusterInterface(cluster) {
  const interfaceName = toInterfaceName(cluster);
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
    lines.push(`  readAttributes(attributeNames: Array<keyof ${interfaceName}Attributes | number>, opts?: { timeout?: number }): Promise<Partial<${interfaceName}Attributes> & Record<number, unknown>>;`);
    lines.push(`  writeAttributes(attributes: Partial<${interfaceName}Attributes>, opts?: { timeout?: number }): Promise<unknown>;`);
    lines.push(`  on<K extends keyof ${interfaceName}Attributes & string>(eventName: \`attr.\${K}\`, listener: (value: ${interfaceName}Attributes[K]) => void): this;`);
    lines.push(`  once<K extends keyof ${interfaceName}Attributes & string>(eventName: \`attr.\${K}\`, listener: (value: ${interfaceName}Attributes[K]) => void): this;`);
  }

  // Add command methods
  for (const cmd of cluster.commands) {
    // Determine return type based on response args
    let returnType = 'void';
    if (cmd.responseArgs && cmd.responseArgs.length > 0) {
      returnType = `{ ${cmd.responseArgs.map(a => `${a.name}: ${a.tsType}`).join('; ')} }`;
    }

    if (cmd.args.length > 0) {
      // Buffer arguments are optional - ZCL allows empty octet strings
      const allArgsOptional = cmd.args.every(a => a.tsType === 'Buffer');
      const argsType = `{ ${cmd.args.map(a => `${a.name}${a.tsType === 'Buffer' ? '?' : ''}: ${a.tsType}`).join('; ')} }`;
      // If all args are optional, make the entire args object optional
      lines.push(`  ${cmd.name}(args${allArgsOptional ? '?' : ''}: ${argsType}, opts?: ClusterCommandOptions): Promise<${returnType}>;`);
    } else {
      lines.push(`  ${cmd.name}(opts?: ClusterCommandOptions): Promise<${returnType}>;`);
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
function generateTypesFile(clusters, clusterDefinitions) {
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

type ClusterCommandOptions = {
  timeout?: number;
  waitForResponse?: boolean;
  disableDefaultResponse?: boolean;
};

type ZCLNodeConstructorInput = {
  endpointDescriptors?: EndpointDescriptor[];
  sendFrame: (endpointId: number, clusterId: number, frame: Buffer) => Promise<void>;
  handleFrame?: (
    endpointId: number,
    clusterId: number,
    frame: Buffer,
    meta?: unknown
  ) => Promise<void>;
};
`);

  // Base ZCLNodeCluster interface
  lines.push(`export interface ZCLNodeCluster extends EventEmitter {
  discoverCommandsGenerated(params?: {
    startValue?: number;
    maxResults?: number;
  }, opts?: { timeout?: number }): Promise<(string | number)[]>;

  discoverCommandsReceived(params?: {
    startValue?: number;
    maxResults?: number;
  }, opts?: { timeout?: number }): Promise<(string | number)[]>;

  readAttributes(
    attributes: Array<string | number>,
    opts?: { timeout?: number }
  ): Promise<{ [x: string]: unknown }>;

  writeAttributes(attributes?: object, opts?: { timeout?: number }): Promise<unknown>;

  configureReporting(attributes?: object, opts?: { timeout?: number }): Promise<void>;

  readReportingConfiguration(attributes?: (string | number)[], opts?: { timeout?: number }): Promise<{
    status: string;
    direction: 'reported' | 'received';
    attributeId: number;
    attributeDataType?: number;
    minInterval?: number;
    maxInterval?: number;
    minChange?: number;
    timeoutPeriod?: number;
  }[]>;

  discoverAttributes(opts?: { timeout?: number }): Promise<(string | number)[]>;

  discoverAttributesExtended(opts?: { timeout?: number }): Promise<{
    name?: string;
    id: number;
    dataTypeId: number;
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
    const interfaceName = toInterfaceName(cluster);
    lines.push(`  ${cluster.clusterName}?: ${interfaceName};`);
  }
  lines.push('}');
  lines.push('');

  // Generate cluster type lookup maps for inference helpers
  lines.push('/** Cluster type lookup by cluster NAME */');
  lines.push('export interface ClusterTypeByName {');
  for (const cluster of clusters) {
    const interfaceName = toInterfaceName(cluster);
    lines.push(`  ${cluster.clusterName}: ${interfaceName};`);
  }
  lines.push('}');
  lines.push('');

  // Generate cluster attribute lookup maps for inference helpers
  lines.push('/** Cluster attributes lookup by cluster NAME */');
  lines.push('export interface ClusterAttributesByName {');
  for (const cluster of clusters) {
    const interfaceName = toInterfaceName(cluster);
    const attributesInterfaceName = `${interfaceName}Attributes`;
    const attributesType = cluster.attributes.length > 0 ? attributesInterfaceName : 'Record<string, unknown>';
    lines.push(`  ${cluster.clusterName}: ${attributesType};`);
  }
  lines.push('}');
  lines.push('');

  lines.push('/** Infer a typed cluster interface from a CLUSTER definition object. */');
  lines.push('export type ClusterTypeFromDefinition<TDef extends { NAME: string; ID: number }> =');
  lines.push("  TDef['NAME'] extends keyof ClusterTypeByName");
  lines.push("    ? ClusterTypeByName[TDef['NAME']]");
  lines.push('    : ZCLNodeCluster;');
  lines.push('');

  lines.push('/** Infer typed cluster attribute map from a CLUSTER definition object. */');
  lines.push('export type ClusterAttributesFromDefinition<TDef extends { NAME: string; ID: number }> =');
  lines.push("  TDef['NAME'] extends keyof ClusterAttributesByName");
  lines.push("    ? ClusterAttributesByName[TDef['NAME']]");
  lines.push('    : Record<string, unknown>;');
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

  // Runtime value exports
  lines.push(`export const ZCLNode: {
  new (node: ZCLNodeConstructorInput): ZCLNode;
};

export const CLUSTER: {
`);
  for (const def of clusterDefinitions) {
    lines.push(`  ${def.constantName}: {`);
    lines.push('    ID: number;');
    lines.push(`    NAME: '${def.clusterName}';`);
    lines.push('    ATTRIBUTES: unknown;');
    lines.push('    COMMANDS: unknown;');
    lines.push('  };');
  }
  lines.push('};');

  // Export all cluster classes
  for (const cluster of clusters) {
    const interfaceName = toInterfaceName(cluster);
    const exportName = cluster.exportName || interfaceName;
    lines.push(`export const ${exportName}: {`);
    lines.push(`  new (...args: any[]): ${interfaceName};`);
    lines.push(`  ID: ${cluster.clusterId};`);
    lines.push(`  NAME: '${cluster.clusterName}';`);
    lines.push('  ATTRIBUTES: unknown;');
    lines.push('  COMMANDS: unknown;');
    lines.push('};');
  }

  lines.push('');
  lines.push('declare const _default: {');
  lines.push('  ZCLNode: typeof ZCLNode;');
  lines.push('  CLUSTER: typeof CLUSTER;');
  for (const cluster of clusters) {
    const exportName = cluster.exportName || toInterfaceName(cluster);
    lines.push(`  ${exportName}: typeof ${exportName};`);
  }
  lines.push('};');
  lines.push('export default _default;');

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
        const cluster = parseCluster(value, name);
        clusters.push(cluster);
        console.log(`  ✓ ${cluster.clusterName} (${cluster.attributes.length} attrs, ${cluster.commands.length} cmds)`);
      } catch (err) {
        console.warn(`  ✗ Failed to parse ${name}: ${err.message}`);
      }
    }
  }

  // Sort clusters alphabetically
  clusters.sort((a, b) => a.clusterName.localeCompare(b.clusterName));

  const clusterDefinitions = Object.entries(clustersModule.CLUSTER)
    .map(([constantName, value]) => ({
      constantName,
      clusterId: value.ID,
      clusterName: value.NAME,
    }))
    .sort((a, b) => a.constantName.localeCompare(b.constantName));

  console.log(`\nGenerating ${OUTPUT_FILE}...`);
  const output = generateTypesFile(clusters, clusterDefinitions);
  fs.writeFileSync(OUTPUT_FILE, output);

  console.log(`Done! Generated types for ${clusters.length} clusters.`);
}

main();
