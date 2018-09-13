import Binding from '@/binding';

export const hasProxy = ('Proxy' in window) || !!Proxy;

export type IBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? IBindingStorage<T[key]> : ProxyHandler<T> | Binding<T[key]>;
};

export interface IBoundAction<T extends object> {
  obj; T;
  prop: keyof T;
}

export default abstract class BaseBound<T extends object> {
  protected storage: IBindingStorage<T> = {} as any;
  public bound = { __bound__: this } as T & { __bound__: BaseBound<T> };

  public abstract bind<U extends T>(obj: U);
}

export function fromPath(obj, path) {
  if (!path)
    return obj;

  return path.split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), obj);
}


// const BoundContructor = Bound;

// export default BoundContructor;
