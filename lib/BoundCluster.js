'use strict';

const { ZCLDataType } = require('./zclTypes');
const { getPropertyDescriptor } = require('./util');
let { debug } = require('./util');

debug = debug.extend('bound-cluster');

class BoundCluster {

  constructor() {
    this.clusterRevision = 1;
  }

  async handleFrame(frame, meta, rawFrame) {
    const commands = this.cluster.commandsById[frame.cmdId] || [];

    const command = commands
      .filter(cmd => frame.frameControl.clusterSpecific === !cmd.global
        && (cmd.global || frame.frameControl.manufacturerSpecific === !!cmd.manufacturerId)
        && (cmd.global || !frame.frameControl.manufacturerSpecific
          || frame.manufacturerId === cmd.manufacturerId))
      .sort((a, b) => (a.isResponse ? 0 : 1) - (b.isResponse ? 0 : 1))
      .pop();

    if (command) {
      const args = command.args
        ? command.args.fromBuffer(frame.data, 0)
        : undefined;

      if (this[command.name]) {
        const result = await this[command.name](args, meta, frame, rawFrame);
        if (command.response && command.response.args) {
          // eslint-disable-next-line new-cap
          return [command.response.id, new command.response.args(result)];
        }
        // eslint-disable-next-line consistent-return
        return;
      }
    }

    throw new Error(`unknown_command_received:${(command || {}).name || frame.cmdId}`);
  }

  async readAttributes({ attributes } = {}) {
    const result = Buffer.alloc(255);
    const attributeMap = attributes
      .map(aId => {
        const attr = this.cluster.attributesById[aId];
        try {
          const value = this[attr.name];
          if (typeof value === 'undefined') {
            throw new Error('not_implemented');
          }
          attr.type.toBuffer(result, value, 0);
          return {
            id: aId,
            status: 'SUCCESS',
            value,
          };
        } catch (e) {
          debug('Failed to parse attribute:', attr ? attr.name || aId : aId, e.message);
        }

        return {
          id: aId,
          status: 'FAILURE',
        };
      });

    const len = this.cluster.attributeArrayStatusDataType.toBuffer(result, attributeMap, 0);

    return { attributes: result.slice(0, len) };
  }

  async writeAttributes({ attributes } = {}) {
    attributes = this.cluster.attributeArrayDataType.fromBuffer(attributes, 0);

    const attributeMap = attributes
      .map(attrValue => {
        const attr = this.cluster.attributesById[attrValue.id];
        try {
          if (typeof attrValue.value === 'undefined') {
            throw new Error('not_parsable');
          }
          if (!(getPropertyDescriptor(this, attr.name) || {}).set) {
            throw new Error('not_settable');
          }

          this[attr.name] = attrValue.value;

          return {
            id: attrValue.id,
            status: 'SUCCESS',
          };
        } catch (e) {
          debug('Failed to parse attribute:', attr ? attr.name || attrValue.id : attrValue.id, e.message);
        }

        return {
          id: attrValue.id,
          status: 'FAILURE',
        };
      });

    return { attributes: attributeMap };
  }

  async writeAttributesAtomic(args) {
    throw new Error('not_implemented');
    // TODO: actually make atomic, capture current state of attrs, exec and restore upon failure
    // return writeAttributesAtomic(args);
  }

  async writeAttributesNoResponse(args) {
    throw new Error('not_implemented');
    // TODO: actually disable response
    // return writeAttributesAtomic(args);
  }

  async configureReporting(
    // {
    //   reports = {
    //     direction,
    //     attributeId,
    //     attributeType,
    //     minInterval,
    //     maxInterval,
    //     minChange,
    //   },
    // }
  ) {
    throw new Error('not_implemented');
    // return {
    //   reports,
    //   status,
    //   direction,
    //   attributeId,
    // };
  }


  async readReportingConfiguration({
    attributes = {
      // direction,
      // attributeId,
    },
  }) {
    throw new Error('not_implemented');
    // return reports;
  }

  async readAttributesStructured({
    attributes = [{
      // attributeId,
      // indexPath,
    }],
  }) {
    throw new Error('not_implemented');
    // return { attributes };
  }

  async writeAttributesStructured({
    attributes = [{
      // attributeId,
      // indexPath,
      // dataTypeId,
      // value,
    }],
  }) {
    throw new Error('not_implemented');
    // return { attributes };
  }

  async discoverCommandsReceived({ startValue, maxResults }) {
    const cmds = [].concat(...Object.values(this.cluster.commandsById))
      .filter(c => !c.global && !c.isResponse && this[c.name])
      .map(c => c.id)
      .sort()
      .filter(cId => cId >= startValue);

    const result = cmds.slice(0, maxResults);
    return {
      lastResponse: result.length === cmds.length,
      commandIds: result,
    };
  }

  async discoverCommandsGenerated({ startValue = 0, maxResults = 255 } = {}) {
    const cmds = [].concat(...Object.values(this.cluster.commandsById))
      .filter(c => !c.global && c.response && this[c.name])
      .map(c => c.response.id)
      .sort()
      .filter(cId => cId >= startValue);

    const result = cmds.slice(0, maxResults);
    return {
      lastResponse: result.length === cmds.length,
      commandIds: result,
    };
  }


  async discoverAttributes({ startValue, maxResults }) {
    const attributes = Object.values(this.cluster.attributesById)
      .filter(attr => attr.type instanceof ZCLDataType && getPropertyDescriptor(this, attr.name));

    return {
      lastResponse: true,
      attributes: attributes.map(a => ({ id: a.id, dataTypeId: a.type.id })),
    };
  }

  async discoverAttributesExtended({ startValue, maxResults }) {
    const attributes = Object.values(this.cluster.attributesById)
      .filter(attr => attr.type instanceof ZCLDataType && getPropertyDescriptor(this, attr.name));

    let { REPORTABLE_ATTRIBUTES } = this;
    if (!Array.isArray(REPORTABLE_ATTRIBUTES)) REPORTABLE_ATTRIBUTES = [];

    return {
      lastResponse: true,
      attributes: attributes.map(a => {
        const acl = [];
        const prop = getPropertyDescriptor(this, a.name);

        if (prop.get) acl.push('readable');
        if (prop.set) acl.push('writable');

        if (REPORTABLE_ATTRIBUTES.includes(a.name)) acl.push('reportable');

        // property is a local value based property, allow it to be read
        if (!acl.length) acl.push('readable');

        return {
          id: a.id,
          dataTypeId: a.type.id,
          acl,
        };
      }),
    };
  }

}

module.exports = BoundCluster;
