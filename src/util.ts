export function fromPath(obj, path) {
  if (!path)
    return obj;

  return path.split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), obj);
}

export const hasProxy = ('Proxy' in window) || !!Proxy;
