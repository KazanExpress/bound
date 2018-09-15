import Binding from '../binding';
import BoundError from '../boundError';
import config from '../config';

export type IBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? IBindingStorage<T[key]> : (ProxyHandler<T> | Binding<T[key]>);
};

export interface IBoundAction<T extends object> {
  obj; T;
  prop: keyof T;
}

export type IBoundPlugin<T extends object> = (action: IBoundAction<T>) => void;

export default abstract class BaseBound<T extends object> {
  public storage: IBindingStorage<T> = {} as any;
  public boundObject = { __bound__: this } as T & { __bound__: BaseBound<T> };

  public constructor(obj: T, public readonly plugins?: IBoundPlugin<T>[]) {
    if (BaseBound.config.debug && typeof obj !== 'object') {
      throw new BoundError('Only object binds are allowed. For property and pure value bindings use Binding from "bound/binding".');
    }

    if (BaseBound.config.debug && obj instanceof BaseBound || BaseBound.isBound(obj)) {
      throw new BoundError('Cannot rebind a bound object.');
    }
  }

  public abstract bind<U extends T>(obj: U, twoWay?: boolean);
  public abstract unbind<U extends T>(obj: U);

  public static get config() { return config; }
  public static isBound(obj: any) {
    return !!obj.__bound__ && (obj.__bound__ instanceof BaseBound);
  }
}
