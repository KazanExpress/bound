export function fromPath(obj, path: string | number) {
  if (!path)
    return obj;

  if (typeof path === 'number' || !~path.indexOf('.'))
    return obj[path];

  return path.split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), obj);
}

export function assignToPath(obj, path: string | number, value: any) {
  if (!path)
    return obj;

  const pathArr = (typeof path === 'string'  && ~path.indexOf('.')) ? path.split('.') : [path];
  const key = pathArr.pop()!;

  const final = pathArr.length === 0 ?
    obj : pathArr.reduce((o, i) => (o === Object(o) ? o[i] : o), obj);

  final[key] = value;
}

export const hasProxy = !!Proxy;
