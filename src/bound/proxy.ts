import Binding from '../binding';
import BoundError from '../boundError';
import BaseBound, { IBoundPlugin } from '@/bound/base';

export type IProxyBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? IProxyBindingStorage<T[key]> : ProxyHandler<T>;
};

export default class ProxyBound<T extends object> extends BaseBound<T> {
  protected storage: IProxyBindingStorage<T> = {} as any;

  constructor(obj: T, plugins?: IBoundPlugin<T>[]) {
    super(obj, plugins);
    throw new BoundError('Class not implemented.');
  }

  public bind<U extends T>(obj: U, twoWay?: boolean, path?: string) {
    throw new BoundError('Method not implemented.');
  }
}
