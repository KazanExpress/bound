import Binding from '../binding';
import BoundError from '../boundError';
import { fromPath } from '../util';
import BaseBound, { IBoundPlugin } from './base';

export type ISimpleBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? ISimpleBindingStorage<T[key]> : Binding<T[key]>;
};

/**
 * Allows multiple full-object bindings.
 * Stores bindings and binds objects together, providing the highest possible abstraction level for bindings.
 *
 * @extends {BaseBound<T>}
 * @template T captures a type of proto object for later usage in binding type inference
 */
export default class Bound<T extends object> extends BaseBound<T> {
  public storage: ISimpleBindingStorage<T> = {} as any;

  /**
   * Creates an instance of Bound using a proto object.
   * @param proto used as an object prototype for the creation of boundObject and storage. Doesn't become bound itself.
   * @param [plugins] to plug into the binding events.
   */
  public constructor(proto: T, plugins?: IBoundPlugin<T>[]) {
    super(proto, plugins);

    try {
      const original = JSON.parse(JSON.stringify(proto));

      for (const key in original) {
        if (typeof original[key] === 'object') { // If the value is object - then treat it like another bound target
          const bound = new Bound(original[key] as any);
          this.boundObject[key] = bound.boundObject;
          this.storage[key] = bound.storage;
        } else {
          const binding = new Binding(
            true,
            original[key],
            plugins ?
              plugins.map(p => () => p({
                obj: this.boundObject,
                prop: key as any,
                T: undefined
              }))
              : plugins
          );
          binding.addSubscriber(this.boundObject, key as any);

          this.storage[key] = binding;
        }
      }
    } catch (e) {
      if (e instanceof RangeError || e instanceof TypeError) {
        throw new BoundError(`There is a possible circular dependency in your object. Nested exception: ${e}`);
      }
    }
  }

  /**
   * Binds an object to all other current subscribers
   *
   * @template U used to capture the bound object type. Must extends original template type.
   * @param obj to bind
   * @param [twoWay] whether the binding should be two-way
   */
  public bind<U extends T>(obj: U, twoWay?: boolean) {
    const __bind = (_obj: U, _twoWay: boolean = true, path: string = '') => {
      for (const key in fromPath(this.storage, path)) {
        const nextPath = !path ? key : `${path}.${key}`;
        const nextStorage = fromPath(this.storage, nextPath);
        const nextValue = _obj[key];

        if (nextStorage instanceof Binding) {
          (nextStorage as Binding).addSubscriber(_obj, key as any, _twoWay ? 'master' : 'slave');
        } else {
          __bind(nextValue, _twoWay, nextPath);
        }
      }
    };

    __bind(obj, twoWay);

    (obj as any).__bound__ = this;
  }


  /**
   * Unbinds an object and destroys all of its listeners
   *
   * @param obj reference of object to be unbound
   */
  public unbind<U extends T>(obj: U) {
    const __unbind = (_obj: U, path: string = '') => {
      for (const key in fromPath(this.storage, path)) {
        const nextPath = !path ? key : `${path}.${key}`;
        const nextStorage = fromPath(this.storage, nextPath);
        const nextValue = _obj[key];

        if (nextStorage instanceof Binding) {
          (nextStorage as Binding).removeSubscriber(_obj, key as any);
        } else {
          __unbind(nextValue, nextPath);
        }
      }

      delete (_obj as any).__bound__;

      return JSON.parse(JSON.stringify(_obj));
    };

    return __unbind(obj);
  }
}
