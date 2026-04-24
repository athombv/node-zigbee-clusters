import type {Cluster, types} from "zigbee-clusters";
import path from "node:path";
import * as fs from "node:fs/promises";
import type {DataType, DataTypes} from "@athombv/data-types";

const INDENTATION_SPACES = 2;

class StringBuilder {
  private strings: string[];
  private indentation: number;

  constructor() {
    this.strings = [];
    this.indentation = 0;
  }

  public startLine(): void {
    this.strings.push(" ".repeat(this.indentation));
  }
  public print(...line: string[]): void {
    this.strings.push(...line);
  }
  public endLine(): void {
    this.strings.push("\n");
  }

  public printLine(...line: string[]): void {
    this.startLine();
    this.strings.push(...line);
    this.endLine();
  }


  public increaseIndent(levels = 1): void {
    this.indentation += INDENTATION_SPACES * levels;
  }
  public setIndent(level: number): void {
    this.indentation = INDENTATION_SPACES * level;
  }
  public decreaseIndent(levels = 1): void {
    this.indentation -= INDENTATION_SPACES * levels;
    if (this.indentation < 0) {
      this.indentation = 0;
    }
  }

  public toString(): string {
    return this.strings.join("");
  }
}

// @ts-expect-error No type declarations
const topModule = await import('../index.js');
const enum8Status = topModule.ZCLDataTypes.enum8Status;

const filePath = path.resolve('index.d.ts');
const templatePath = path.resolve('scripts/template.d.ts.txt');
await main();

async function main(): Promise<void> {
  console.log('Writing clusters to', filePath);

  const stringBuilder = new StringBuilder();
  // Write preamble and open module declaration
  stringBuilder.printLine('declare module "zigbee-clusters" {')
  stringBuilder.increaseIndent();
  stringBuilder.printLine('import {Bitmap} from "@athombv/data-types";')

  // @ts-expect-error No type declarations
  const clustersModule = await import("../lib/clusters/index.js");
  for (const [name, value] of Object.entries(clustersModule.default)) {
    if (name !== 'Cluster' && name !== 'CLUSTER') {
      await formatCluster(stringBuilder, name, value as typeof Cluster);
    }
  }

  // Open CLUSTER
  stringBuilder.printLine("const CLUSTER: {");
  stringBuilder.increaseIndent();

  for (const [key, value] of Object.entries(clustersModule.default.CLUSTER)) {
    const definition = value as {ID: number, NAME: string};
    const clusterClass = clustersModule.default.Cluster.clusters[definition.ID];
    let clusterName = clusterClass.name;
    // Class names are inconsistent
    if (clusterName === 'TouchlinkCluster') {
      clusterName = 'TouchLinkCluster';
    }
    if (!clusterName.endsWith("Cluster")) {
      clusterName = `${clusterName}Cluster`;
    }
    stringBuilder.printLine(`${key}: {`);
    stringBuilder.increaseIndent();
    stringBuilder.printLine(`ID: 0x${definition.ID.toString(16).padStart(4, "0")},`);
    stringBuilder.printLine(`NAME: ${JSON.stringify(definition.NAME)},`);
    stringBuilder.printLine(`ATTRIBUTES: Readonly<${clusterName}Attributes>,`);
    stringBuilder.printLine(`COMMANDS: Readonly<${clusterName}Commands>,`);
    stringBuilder.decreaseIndent();
    stringBuilder.printLine('},');
  }

  // Close CLUSTER
  stringBuilder.decreaseIndent();
  stringBuilder.printLine("};");

  const template = await fs.readFile(templatePath, 'utf8');
  const templateHeader = "declare module 'zigbee-clusters' {";
  const templateBody = template.slice(template.indexOf(templateHeader) + templateHeader.length);
  // Close module declaration
  stringBuilder.print(templateBody);

  // Write the result to index.d.ts
  await fs.writeFile(filePath, stringBuilder.toString());

  console.log("Done!");
}


async function formatCluster(stringBuilder: StringBuilder, className: string, classDefinition: typeof Cluster): Promise<void> {
  stringBuilder.startLine();
  stringBuilder.print(`type ${className}Attributes = `);
  if (Object.keys(classDefinition.ATTRIBUTES).length === 0) {
    stringBuilder.print("Record<never, never>;");
    stringBuilder.endLine();
  } else {
    // Open attributes
    stringBuilder.print("{");
    stringBuilder.endLine();
    stringBuilder.increaseIndent();
    for (const attribute in classDefinition.ATTRIBUTES) {
      const attributeDefinition = classDefinition.ATTRIBUTES[attribute];
      formatAttribute(stringBuilder, className, attribute, attributeDefinition);
    }
    // Close attributes
    stringBuilder.decreaseIndent();
    stringBuilder.printLine('};');
  }

  stringBuilder.startLine();
  stringBuilder.print(`type ${className}Commands = `);
  if (Object.keys(classDefinition.COMMANDS).length === 0) {
    stringBuilder.print("Record<never, never>;");
    stringBuilder.endLine();
  } else {
    // Open commands
    stringBuilder.print("{");
    stringBuilder.endLine();
    stringBuilder.increaseIndent();
    for (const command in classDefinition.COMMANDS) {
      const commandDefinition = classDefinition.COMMANDS[command];
      formatCommand(stringBuilder, className, command, commandDefinition);
    }
    // Close commands
    stringBuilder.decreaseIndent();
    stringBuilder.printLine('};');
  }

  // Open class
  stringBuilder.printLine(`class ${className}<Attributes extends types.AttributeDefinitions = ${className}Attributes, Commands extends types.CommandDefinitions = ${className}Commands> extends Cluster<Attributes, Commands> {`);

  stringBuilder.increaseIndent();
  for (const command in classDefinition.COMMANDS) {
    const commandDefinition = classDefinition.COMMANDS[command];
    formatCommandMethod(stringBuilder, className, command, commandDefinition);
  }

  // Close class
  stringBuilder.decreaseIndent();
  stringBuilder.printLine('}');
}


function formatAttribute(stringBuilder: StringBuilder, className: string, name: string, definition: types.AttributeDefinition): void {
  stringBuilder.startLine();
  stringBuilder.print(`${name}: { id: 0x${definition.id.toString(16).padStart(2, "0")}`);
  stringBuilder.print(', type: ZCLDataType<');
  formatZCLDataTypeGeneric(stringBuilder, className, name, definition.type);
  stringBuilder.print("> },");
  stringBuilder.endLine();
}


function formatCommand(stringBuilder: StringBuilder, className: string, name: string, definition: types.CommandDefinition): void {
  stringBuilder.startLine();
  stringBuilder.print(`${name}: { id: 0x${definition.id.toString(16).padStart(2, "0")}`);
  stringBuilder.print(`, direction: ${JSON.stringify(definition.direction ?? "DIRECTION_SERVER_TO_CLIENT")}`);

  if (definition.frameControl !== undefined) {
    stringBuilder.print(`, frameControl: ${JSON.stringify(definition.frameControl)}`);
  }
  if (definition.encodeMissingFieldsBehavior !== undefined) {
    stringBuilder.print(`, encodeMissingFieldsBehavior: ${JSON.stringify(definition.encodeMissingFieldsBehavior)}`);
  }
  if (definition.global !== undefined) {
    stringBuilder.print(`, global: ${definition.global}`);
  }

  if (definition.args !== undefined) {
    stringBuilder.print(", args: ");
    if (Object.keys(definition.args).length === 0) {
      throw new Error(`Empty args definition for ${className} command ${name}`)
    } else {
      // Open args
      stringBuilder.print("{");
      stringBuilder.endLine();
      stringBuilder.increaseIndent(2);
      for (const [key, arg] of Object.entries(definition.args)) {
        stringBuilder.startLine();
        stringBuilder.print(`${key}: ZCLDataType<`);
        formatZCLDataTypeGeneric(stringBuilder, className, name, arg);
        stringBuilder.print(">,");
        stringBuilder.endLine();
      }
      // Close args
      stringBuilder.decreaseIndent();
      stringBuilder.printLine('},');
      // Spaces before closing bracket of attribute
      stringBuilder.decreaseIndent();
      stringBuilder.startLine();
    }
  } else {
    // Space before closing bracket of attribute
    stringBuilder.print(" ");
  }

  stringBuilder.print('},');
  stringBuilder.endLine();
}


function formatCommandMethod(stringBuilder: StringBuilder, className: string, name: string, definition: types.CommandDefinition): void {
  // Method name
  stringBuilder.startLine();
  if (definition.direction === 'DIRECTION_SERVER_TO_CLIENT') {
    // Bound cluster
    stringBuilder.print("on", name.charAt(0).toUpperCase(), name.slice(1));
  } else {
    stringBuilder.print(name);
  }

  // Open method
  stringBuilder.print("(");
  stringBuilder.endLine();
  stringBuilder.increaseIndent();

  if (definition.direction === 'DIRECTION_SERVER_TO_CLIENT') {
    if (definition.args === undefined) {
      stringBuilder.printLine('args: undefined,')
    } else {
      // Open args
      stringBuilder.printLine('args: {');
      stringBuilder.increaseIndent();

      for (const arg in definition.args) {
        stringBuilder.startLine();
        stringBuilder.print(`${arg}?: `);
        formatZCLDataTypeGeneric(stringBuilder, className, name, definition.args[arg]);
        stringBuilder.print(',');
        stringBuilder.endLine();
      }

      // Close args
      stringBuilder.decreaseIndent();
      stringBuilder.printLine('},');
    }

    stringBuilder.printLine("meta: object,")
    stringBuilder.printLine("frame: object,")
    stringBuilder.printLine("rawFrame: Buffer,")
  } else {
    // Open args
    stringBuilder.startLine();
    stringBuilder.print('args');
    if (definition.args === undefined || definition.encodeMissingFieldsBehavior !== undefined) {
      stringBuilder.print('?');
    }
    stringBuilder.print(': {');
    stringBuilder.endLine();
    stringBuilder.increaseIndent();
    stringBuilder.printLine('manufacturerId?: number,');

    for (const arg in definition.args) {
      stringBuilder.startLine();
      stringBuilder.print(`${arg}?: `);
      formatZCLDataTypeGeneric(stringBuilder, className, name, definition.args[arg]);
      stringBuilder.print(',');
      stringBuilder.endLine();
    }

    // Close args
    stringBuilder.decreaseIndent();
    stringBuilder.printLine('},');


    // Opts
    stringBuilder.printLine('opts?: {');
    stringBuilder.increaseIndent();
    stringBuilder.printLine('waitForResponse?: boolean,');
    stringBuilder.printLine('timeout?: number,');
    stringBuilder.printLine('disableDefaultResponse?: boolean,');
    stringBuilder.decreaseIndent();
    stringBuilder.printLine('},');
  }

  // Close method
  stringBuilder.decreaseIndent();
  stringBuilder.startLine();
  stringBuilder.print("): Promise<");

  if (definition.response === undefined) {
    stringBuilder.print("void");
  } else {
    // Open return object
    stringBuilder.print("{")
    stringBuilder.endLine()
    stringBuilder.increaseIndent()
    for (let argName in definition.response.args) {
      const argType = definition.response.args[argName];
      stringBuilder.startLine();
      stringBuilder.print(argName);
      if (definition.response.encodeMissingFieldsBehavior === 'skip') {
        stringBuilder.print("?")
      }
      stringBuilder.print(": ")
      formatZCLDataTypeGeneric(stringBuilder, className, name, argType);
      stringBuilder.print(",")
      stringBuilder.endLine();
    }
    // Close return object
    stringBuilder.decreaseIndent();
    stringBuilder.startLine();
    stringBuilder.print("}")
  }
  stringBuilder.print(">;")
  stringBuilder.endLine();
}


function formatZCLDataTypeGeneric(stringBuilder: StringBuilder, className: string, command: string, definition: DataType<any>): void {
  const typeName = definition.shortName as keyof typeof DataTypes;
  const typeArgs: Array<any> = definition.args;

  if (typeName === undefined) {
    // Struct
    stringBuilder.print('unknown');
  } else if (typeName.startsWith('enum')) {
    if (definition === enum8Status) {
      stringBuilder.print('types.ZCLEnum8Status')
    } else {
      formatEnumDataType(stringBuilder, className, command, typeName, typeArgs);
    }
  } else if (typeName.startsWith('map')) {
    formatMapDataType(stringBuilder, className, command, typeName, typeArgs);
  } else if (typeName.startsWith("_Array")) {
    formatArrayDataType(stringBuilder, className, command, typeName, typeArgs);
  } else {
    stringBuilder.print(zclDataTypeToValueType(typeName));
  }
}


function formatEnumDataType(stringBuilder: StringBuilder, className: string, field: string, typeName: string, typeArgs: Array<unknown>): void {
  const typeArg = typeArgs[0];
  if (typeof typeArg !== 'object' || Array.isArray(typeArg) || typeArg === null) {
    throw new Error(`Invalid ${typeName} arg for ${className} ${field}`);
  }

  const entries = Object.keys(typeArg);
  if (entries.length === 0) {
    stringBuilder.print('unknown');
  } else {
    stringBuilder.print(entries.map(arg => JSON.stringify(arg)).join(" | "));
  }
}


function formatMapDataType(stringBuilder: StringBuilder, className: string, field: string, typeName: string, typeArgs: Array<unknown>): void {
  if (typeof typeArgs !== 'object' || !Array.isArray(typeArgs)) {
    throw new Error(`Invalid ${typeName} arg for ${className} ${field}`);
  }
  for (const typeArg of typeArgs) {
    if (!(typeArg === null || typeof typeArg === 'string')) {
      throw new Error(`Invalid ${typeName} arg for ${className} ${field}`);
    }
  }
  if (typeArgs.length === 0) {
    stringBuilder.print('Bitmap<string>');
  } else {
    stringBuilder.print('Bitmap<');
    stringBuilder.print(typeArgs.map(arg => JSON.stringify(arg)).join(" | "));
    stringBuilder.print(">");
  }
}

function formatArrayDataType(stringBuilder: StringBuilder, className: string, field: string, typeName: string, typeArgs: Array<DataType<any>>): void {
  stringBuilder.print('Array<')
  formatZCLDataTypeGeneric(stringBuilder, className, field, typeArgs[0])
  stringBuilder.print('>')
}


function zclDataTypeToValueType(type: keyof typeof DataTypes): string {
  switch (type) {
    case "noData":
      return "null";
    case "data8":
    case "data16":
    case "data24":
    case "data32":
    case "data40":
    case "data48":
    case "data56":
      return "Buffer";
    case "bool":
      return "boolean";
    case "map8":
    case "map16":
    case "map24":
    case "map32":
    case "map40":
    case "map48":
    case "map56":
    case "map64":
      throw new Error("Complex type");
    case "uint8":
    case "uint16":
    case "uint24":
    case "uint32":
    case "uint40":
    case "uint48":
    case "int8":
    case "int16":
    case "int24":
    case "int32":
    case "int40":
    case "int48":
      return "number";
    case "enum8":
    case "enum16":
    case "enum32":
      throw new Error("Complex type");
    case "single":
    case "double":
      return "number";
    case "octstr":
      return "Buffer"
    case "string":
    case "EUI48":
    case "EUI64":
    case "key128":
      return "string";
  }
  // Internal types
  switch (type as string) {
    case "_map4":
      throw new Error("Complex type");
    case "_uint4":
      return "number";
    case "_enum4":
      throw new Error("Complex type");
    case "_buffer":
    case "_buffer8":
    case "_buffer16":
      return "Buffer";
    case "_Array0":
    case "_Array8":
      throw new Error("Complex type");
    case "_FixedString":
      return "string";
  }
  throw new Error(`Unknown ZCL type ${type}`);
}
