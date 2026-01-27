'use strict';

/* eslint-disable no-console, no-use-before-define */

/**
 * Type generation script for zigbee-clusters
 * Parses cluster definitions and generates TypeScript interfaces
 */

const fs = require('fs');
const path = require('path');

const CLUSTERS_DIR = path.join(__dirname, '../lib/clusters');
const OUTPUT_FILE = path.join(__dirname, '../index.d.ts');

// Files to skip (not actual cluster definitions)
const SKIP_FILES = ['index.js'];

/**
 * Convert ZCLDataType to TypeScript type string
 */
function zclTypeToTS(typeStr) {
  // Handle simple types - check these first (more specific matches)
  if (typeStr.includes('ZCLDataTypes.bool')) return 'boolean';
  if (typeStr.includes('ZCLDataTypes.uint48')) return 'number';
  if (typeStr.includes('ZCLDataTypes.uint40')) return 'number';
  if (typeStr.includes('ZCLDataTypes.uint32')) return 'number';
  if (typeStr.includes('ZCLDataTypes.uint24')) return 'number';
  if (typeStr.includes('ZCLDataTypes.uint16')) return 'number';
  if (typeStr.includes('ZCLDataTypes.uint8')) return 'number';
  if (typeStr.includes('ZCLDataTypes.int32')) return 'number';
  if (typeStr.includes('ZCLDataTypes.int24')) return 'number';
  if (typeStr.includes('ZCLDataTypes.int16')) return 'number';
  if (typeStr.includes('ZCLDataTypes.int8')) return 'number';
  if (typeStr.includes('ZCLDataTypes.string')) return 'string';
  if (typeStr.includes('ZCLDataTypes.octstr')) return 'Buffer';
  if (typeStr.includes('ZCLDataTypes.data32')) return 'number';
  if (typeStr.includes('ZCLDataTypes.data24')) return 'number';
  if (typeStr.includes('ZCLDataTypes.data16')) return 'number';
  if (typeStr.includes('ZCLDataTypes.data8')) return 'number';
  if (typeStr.includes('ZCLDataTypes.EUI64')) return 'string';
  if (typeStr.includes('ZCLDataTypes.securityKey128')) return 'Buffer';
  if (typeStr.includes('ZCLDataTypes.buffer')) return 'Buffer';

  // Handle enum8/enum16 - extract keys (multiline support)
  const enumMatch = typeStr.match(/ZCLDataTypes\.enum(?:8|16)\(\{([\s\S]*?)\}\)/);
  if (enumMatch) {
    const enumBody = enumMatch[1];
    const keys = extractEnumKeys(enumBody);
    if (keys.length > 0) {
      return keys.map(k => `'${k}'`).join(' | ');
    }
  }

  // Handle map8/map16/map32 - extract flag names (can span multiple lines)
  const mapMatch = typeStr.match(/ZCLDataTypes\.map(?:8|16|32)\(([\s\S]*?)\)/);
  if (mapMatch) {
    const mapArgs = mapMatch[1];
    const flags = extractMapFlags(mapArgs);
    if (flags.length > 0) {
      return `Partial<{ ${flags.map(f => `${f}: boolean`).join('; ')} }>`;
    }
  }

  // Handle Array0/Array8
  if (typeStr.includes('ZCLDataTypes.Array')) {
    return 'unknown[]';
  }

  // Fallback
  return 'unknown';
}

/**
 * Extract enum keys from enum body string
 */
function extractEnumKeys(enumBody) {
  const keys = [];
  // Match patterns like: keyName: 0, or 'keyName': 0
  const keyPattern = /['"]?(\w+)['"]?\s*:/g;
  let match = keyPattern.exec(enumBody);
  while (match !== null) {
    keys.push(match[1]);
    match = keyPattern.exec(enumBody);
  }
  return keys;
}

/**
 * Extract map flag names from map arguments
 */
function extractMapFlags(mapArgs) {
  const flags = [];
  // Match quoted strings
  const flagPattern = /['"](\w+)['"]/g;
  let match = flagPattern.exec(mapArgs);
  while (match !== null) {
    flags.push(match[1]);
    match = flagPattern.exec(mapArgs);
  }
  return flags;
}

/**
 * Parse a cluster file and extract definitions
 */
function parseClusterFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, '.js');

  // Extract cluster name
  const nameMatch = content.match(/static\s+get\s+NAME\(\)\s*\{\s*return\s+['"](\w+)['"]/);
  if (!nameMatch) {
    console.warn(`Could not find NAME in ${fileName}`);
    return null;
  }
  const clusterName = nameMatch[1];

  // Extract cluster ID
  const idMatch = content.match(/static\s+get\s+ID\(\)\s*\{\s*return\s+(\d+)/);
  const clusterId = idMatch ? parseInt(idMatch[1], 10) : null;

  // Extract ATTRIBUTES block
  const attributes = parseAttributesBlock(content);

  // Extract COMMANDS block
  const commands = parseCommandsBlock(content);

  return {
    fileName,
    clusterName,
    clusterId,
    attributes,
    commands,
  };
}

/**
 * Strip comments from code
 */
function stripComments(code) {
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, '');
  return code;
}

/**
 * Parse ATTRIBUTES block from file content
 */
function parseAttributesBlock(content) {
  const attributes = [];

  // Find ATTRIBUTES object - handle both const ATTRIBUTES = { and ATTRIBUTES: {
  const attrMatch = content.match(/(?:const\s+)?ATTRIBUTES\s*=\s*\{/);
  if (!attrMatch) return attributes;

  const startIdx = attrMatch.index + attrMatch[0].length;
  let braceCount = 1;
  let idx = startIdx;

  // Find matching closing brace
  while (braceCount > 0 && idx < content.length) {
    if (content[idx] === '{') braceCount++;
    else if (content[idx] === '}') braceCount--;
    idx++;
  }

  let attrBlock = content.substring(startIdx, idx - 1);

  // Strip comments for easier parsing
  attrBlock = stripComments(attrBlock);

  // Split into top-level attribute entries
  const attrEntries = splitTopLevelEntries(attrBlock);

  for (const entry of attrEntries) {
    // Match attribute name - may have leading whitespace/newlines after comment removal
    const nameMatch = entry.match(/^\s*(\w+)\s*:/);
    if (!nameMatch) continue;

    const attrName = nameMatch[1];

    // Extract the type definition - look for type: followed by the type value
    const typeMatch = entry.match(/type\s*:\s*([\s\S]+?)(?:,\s*(?:id|manufacturerId)\s*:|$)/);
    if (!typeMatch) {
      // Try alternative: type is last in object
      const typeMatchAlt = entry.match(/type\s*:\s*([\s\S]+?)\s*[,}]?\s*$/);
      if (typeMatchAlt) {
        const typeStr = typeMatchAlt[1].trim().replace(/,\s*$/, '');
        const tsType = zclTypeToTS(typeStr);
        attributes.push({ name: attrName, tsType });
      }
      continue;
    }

    const typeStr = typeMatch[1].trim().replace(/,\s*$/, '');
    const tsType = zclTypeToTS(typeStr);
    attributes.push({ name: attrName, tsType });
  }

  return attributes;
}

/**
 * Parse COMMANDS block from file content
 */
function parseCommandsBlock(content) {
  const commands = [];

  const cmdMatch = content.match(/(?:const\s+)?COMMANDS\s*=\s*\{/);
  if (!cmdMatch) return commands;

  const startIdx = cmdMatch.index + cmdMatch[0].length;
  let braceCount = 1;
  let idx = startIdx;

  while (braceCount > 0 && idx < content.length) {
    if (content[idx] === '{') braceCount++;
    else if (content[idx] === '}') braceCount--;
    idx++;
  }

  let cmdBlock = content.substring(startIdx, idx - 1);

  // Strip comments for easier parsing
  cmdBlock = stripComments(cmdBlock);

  // Parse commands - need to handle nested braces for args
  // Split by top-level command definitions
  const cmdEntries = splitTopLevelEntries(cmdBlock);

  for (const entry of cmdEntries) {
    const nameMatch = entry.match(/^\s*(\w+)\s*:/);
    if (!nameMatch) continue;

    const cmdName = nameMatch[1];
    const args = parseCommandArgs(entry);

    commands.push({ name: cmdName, args });
  }

  return commands;
}

/**
 * Split a block into top-level entries (handling nested braces and parentheses)
 */
function splitTopLevelEntries(block) {
  const entries = [];
  let braceCount = 0;
  let parenCount = 0;
  let currentEntry = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < block.length; i++) {
    const char = block[i];
    const prevChar = i > 0 ? block[i - 1] : '';

    // Handle strings
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
      else if (char === ',' && braceCount === 0 && parenCount === 0) {
        if (currentEntry.trim()) {
          entries.push(currentEntry.trim());
        }
        currentEntry = '';
        continue;
      }
    }

    currentEntry += char;
  }

  if (currentEntry.trim()) {
    entries.push(currentEntry.trim());
  }

  return entries;
}

/**
 * Parse command arguments from a command entry
 */
function parseCommandArgs(cmdEntry) {
  const args = [];

  // Find args block
  const argsMatch = cmdEntry.match(/args\s*:\s*\{/);
  if (!argsMatch) return args;

  const startIdx = argsMatch.index + argsMatch[0].length;
  let braceCount = 1;
  let idx = startIdx;

  while (braceCount > 0 && idx < cmdEntry.length) {
    if (cmdEntry[idx] === '{') braceCount++;
    else if (cmdEntry[idx] === '}') braceCount--;
    idx++;
  }

  const argsBlock = cmdEntry.substring(startIdx, idx - 1);

  // Parse each argument
  const argEntries = splitTopLevelEntries(argsBlock);

  for (const argEntry of argEntries) {
    const nameMatch = argEntry.match(/^\s*(\w+)\s*:/);
    if (!nameMatch) continue;

    const argName = nameMatch[1];
    const typeStr = argEntry.substring(argEntry.indexOf(':') + 1).trim();
    const tsType = zclTypeToTS(typeStr);

    args.push({ name: argName, tsType });
  }

  return args;
}

/**
 * Convert cluster name to PascalCase interface name
 */
function toInterfaceName(clusterName) {
  // Handle special cases
  const name = clusterName.charAt(0).toUpperCase() + clusterName.slice(1);
  return `${name}Cluster`;
}

/**
 * Generate TypeScript interface for a cluster
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
      // Buffer arguments (octstr, securityKey128, buffer) are optional because ZCL allows
      // empty octet strings (length 0). The data-types library serializes undefined/omitted
      // Buffer args as empty Buffers. Example: DoorLock.lockDoor({ pinCode }) - pinCode is
      // optional when the lock doesn't require PIN authentication.
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
  lines.push('');

  // Also export at top level for ESM
  lines.push('export { ZCLNode, ZCLNodeCluster, ZCLNodeEndpoint, ClusterRegistry };');

  return lines.join('\n');
}

/**
 * Main entry point
 */
function main() {
  console.log('Scanning cluster files...');

  const files = fs.readdirSync(CLUSTERS_DIR)
    .filter(f => f.endsWith('.js') && !SKIP_FILES.includes(f));

  console.log(`Found ${files.length} cluster files`);

  const clusters = [];

  for (const file of files) {
    const filePath = path.join(CLUSTERS_DIR, file);
    try {
      const cluster = parseClusterFile(filePath);
      if (cluster) {
        clusters.push(cluster);
        console.log(`  ✓ ${cluster.clusterName} (${cluster.attributes.length} attrs, ${cluster.commands.length} cmds)`);
      }
    } catch (err) {
      console.warn(`  ✗ Failed to parse ${file}: ${err.message}`);
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
