import Binding, { IBindingPlugin } from '../binding';
import BoundError from '../boundError';
import { fromPath } from '../util';
import BaseBound, { IBoundPluginMap } from './base';

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
   * @param [plugins] to plug into the binding events. Do not work yet.
   *///TODO: Bound plugins!
  public constructor(proto: T, plugins?: IBoundPluginMap<T>) {
    super(proto, plugins);

    const original = JSON.parse(JSON.stringify(proto));

    for (const key in original) {
      if (typeof original[key] === 'object') { // If the value is object - then treat it like another bound target
        const bound = new Bound(original[key] as any, (plugins || {})[key]);

        this.boundObject[key] = bound.boundObject;
        this.storage[key] = bound.storage;
      } else {
        const binding = new Binding(false, original[key], [(plugins || {})[key]]);

        binding.addSubscriber(this.boundObject, key as any);

        this.storage[key] = binding;
      }
    }
  }

  /**
   * Binds an object to all other current subscribers
   *
   * @template U used to capture the bound object type. Must extends original template type.
   * @param obj to bind
   * @param [twoWay] whether the binding should be two-way
   *///TODO: rework this function. It's a mess.
  public bind<U extends T>(obj: U, twoWay?: boolean) {
    const __bind = (_obj: U, _twoWay: boolean = true, path: string = '') => {
      Object.defineProperty(_obj, '__bound__', {
        value: fromPath(this.boundObject, path).__bound__,
        writable: true
      });

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

    return this;
  }


  /**
   * Unbinds an object and destroys all of its listeners
   *
   * @param obj reference of object to be unbound
   */
  public unbind<U extends T>(obj: U) {
    const __unbind = (_obj: U, path: string = '') => {
      (_obj as any).__bound__ = undefined;

      for (const key in fromPath(this.storage, path)) {
        const nextPath = !path ? key : `${path}.${key}`;
        const nextStorage = fromPath(this.storage, nextPath);
        const nextValue = _obj[key];

        if (nextStorage instanceof Binding) {
          (nextStorage as Binding).removeSubscriber(_obj, key as any);
        } else {
          _obj[key] = __unbind(nextValue, nextPath);
        }
      }


      return JSON.parse(JSON.stringify(_obj));
    };

    return __unbind(obj);
  }
}
