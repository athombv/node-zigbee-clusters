const Node = require('../lib/Node');

module.exports = config => {
  const remotenode = {
    sendFrame: (...args) => console.log('loopback ep %d cluster %d', ...args) | remotenode.handleFrame(...args),
    bind: console.log.bind(console, 'binding: ep %d, cluster %d '),
    endpointDescriptors: config
  };
  return new Node(remotenode);
};
