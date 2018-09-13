import Binding from '../binding';
import BoundError from '../boundError';
import BaseBound, { IBoundPlugin } from '../bound/base';
import { fromPath } from '../util';

export type ISimpleBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? ISimpleBindingStorage<T[key]> : Binding<T[key]>;
};

export default class SimpleBound<T extends object> extends BaseBound<T> {
  public storage: ISimpleBindingStorage<T> = {} as any;

  public constructor(proto: T, plugins?: IBoundPlugin<T>[]) {
    super(proto, plugins);

    const original = JSON.parse(JSON.stringify(proto));

    try {
      for (const key in original) {
        if (typeof original[key] === 'object') { // If the value is object - then treat it like another bound target
          const bound = new SimpleBound(original[key] as any);
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
          binding.addBinding(this.bound, key as string);

          this.storage[key] = binding;
        }
      }
    } catch (e) {
      if (e instanceof RangeError && SimpleBound.config.debug) {
        throw new BoundError(`There is a possible circular dependency in your object. Nested exception: ${e}`);
      }
    }
  }

  public bind<U extends T>(obj: U, twoWay: boolean = true, path: string = '') {
    try {
      for (const key in fromPath(this.storage, path)) {
        if (this.storage[key] instanceof Binding) {
          (this.storage[key] as Binding).addBinding(obj, key, twoWay ? 'master' : 'slave');
        } else {
          this.bind(obj[key], twoWay, !path ? key : `${path}.${key}`);
        }
      }

      (obj as any).__bound__ = this;
    } catch (e) {
      if (e instanceof RangeError && SimpleBound.config.debug) {
        throw new BoundError(`There is a possible circular dependency in your object. Nested exception: ${e}`);
      }
    }
  }
}
