
function getPropertyDescriptor(obj, name) {
  if(!obj) return;

  return Object.getOwnPropertyDescriptor(obj, name) || 
    getPropertyDescriptor(Object.getPrototypeOf(obj), name);
}

module.exports = {
  getPropertyDescriptor
};
