import Binding from '../binding';
import BoundError from '../boundError';
import { fromPath } from '../util';
import BaseBound, { IBoundPlugin } from './base';

export type ISimpleBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? ISimpleBindingStorage<T[key]> : Binding<T[key]>;
};

export default class Bound<T extends object> extends BaseBound<T> {
  public storage: ISimpleBindingStorage<T> = {} as any;

  public constructor(proto: T, plugins?: IBoundPlugin<T>[]) {
    super(proto, plugins);

    try {
      const original = JSON.parse(JSON.stringify(proto));

      for (const key in original) {
        if (typeof original[key] === 'object') { // If the value is object - then treat it like another bound target
          const bound = new Bound(original[key] as any);
          this.bound[key] = bound.bound;
          this.storage[key] = bound.storage;
        } else {
          const binding = new Binding(
            true,
            original[key],
            plugins ?
              plugins.map(p => () => p({
                obj: this.bound,
                prop: key as any,
                T: undefined
              }))
              : plugins
          );
          binding.addBinding(this.bound, key as any);

          this.storage[key] = binding;
        }
      }
    } catch (e) {
      if (e instanceof RangeError || e instanceof TypeError) {
        throw new BoundError(`There is a possible circular dependency in your object. Nested exception: ${e}`);
      }
    }
  }

  public bind<U extends T>(obj: U, twoWay?: boolean) {
    const __bind = (_obj: U, _twoWay: boolean = true, path: string = '') => {
      for (const key in fromPath(this.storage, path)) {
        const nextPath = !path ? key : `${path}.${key}`;
        const nextStorage = fromPath(this.storage, nextPath);
        const nextValue = _obj[key];

        if (nextStorage instanceof Binding) {
          (nextStorage as Binding).addBinding(_obj, key as any, _twoWay ? 'master' : 'slave');
        } else {
          __bind(nextValue, _twoWay, nextPath);
        }
      }
    };

    __bind(obj, twoWay);

    (obj as any).__bound__ = this;
  }


  public unbind<U extends T>(obj: U) {
    const __unbind = (_obj: U, path: string = '') => {
      for (const key in fromPath(this.storage, path)) {
        const nextPath = !path ? key : `${path}.${key}`;
        const nextStorage = fromPath(this.storage, nextPath);
        const nextValue = _obj[key];

        if (nextStorage instanceof Binding) {
          (nextStorage as Binding).removeBinding(_obj, key as any);
        } else {
          __unbind(nextValue, nextPath);
        }
      }

      return JSON.parse(JSON.stringify(_obj));
    };

    return __unbind(obj);
  }
}
