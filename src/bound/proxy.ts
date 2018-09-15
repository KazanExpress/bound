import Binding from '../binding';
import BoundError from '../boundError';
import BaseBound, { IBoundPluginMap } from './base';

export type IProxyBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? IProxyBindingStorage<T[key]> : ProxyHandler<T>;
};

export default class ProxyBound<T extends object> extends BaseBound<T> {
  public storage: IProxyBindingStorage<T> = {} as any;

  constructor(obj: T, plugins?: IBoundPluginMap<T>) {
    super(obj, plugins);
    throw new BoundError('Class not implemented.');
  }

  public bind<U extends T>(obj: U, twoWay?: boolean) {
    throw new BoundError('Method not implemented.');
  }

  public unbind<U extends T>(obj: U) {
    throw new BoundError('Method not implemented.');
  }
}
