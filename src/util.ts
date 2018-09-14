/**
 * fromPath
 * Returns a value from an object by a given path (usually string).
 *
 * @param obj an object to get a value from.
 * @param path to get a value by.
 * @returns a value from a given path. If a path is invalid - returns undefined.
 */
export function fromPath(obj, path: string | number) {
  if (!path)
    return obj;

  if (typeof path === 'number' || !~path.indexOf('.'))
    return obj[path];

  return path.split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), obj);
}

/**
 * assignToPath
 * Assigns a value to an object by a given path (usually string).
 * If the path is invalid, silently creates the required path and assigns a value
 *
 * @param obj an object to get a value from.
 * @param path to get a value by.
 * @param value a value to assign.
 */
export function assignToPath(obj, path: string | number, value: any) {
  if (!path)
    return obj;

  const pathArr = (typeof path === 'string'  && ~path.indexOf('.')) ? path.split('.') : [path];
  const key = pathArr.pop()!;

  const final = pathArr.length === 0 ?
    obj : pathArr.reduce((o, i) => {
      if (o[i] === undefined)
        o[i] = {};

      return o[i];
    }, obj);

  final[key] = value;
}

export const hasProxy = !!Proxy;
