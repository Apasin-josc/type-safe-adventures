function isInstanceOf(obj, Class) {
  // Los primitivos no tienen cadena que recorrer.
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;

  // Igual que recorrer una linked list: avanza al "siguiente" hasta llegar a null.
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Class.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

module.exports = { isInstanceOf };
