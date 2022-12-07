type EndpointDescriptor = {
  endpointId: number;
  inputClusters: number[];
  outputClusters: number[];
};

type ConstructorOptions = {
  endpointDescriptors: EndpointDescriptor[];
  sendFrame: (endpointId: number, clusterId: number, frame: Buffer) => Promise<void>;
};
type ZCLNodeCluster = {
  readAttributes: (...args: string[]) => Promise<void>;
};
type ZCLNodeEndpoint = {
  clusters: { [clusterName: string]: ZCLNodeCluster };
};

interface ZCLNode {
  endpoints: { [endpointId: number]: ZCLNodeEndpoint };
  handleFrame: (
    endpointId: number,
    clusterId: number,
    frame: Buffer,
    meta?: unknown
  ) => Promise<void>;
}

declare module "zigbee-clusters" {
  export var ZCLNode: {
    new (options: ConstructorOptions): ZCLNode;
  };
  export const CLUSTER: {
    [key: string]: { ID: number; NAME: string; ATTRIBUTES: any; COMMANDS: any };
  };
}
