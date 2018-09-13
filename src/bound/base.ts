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

  public bind<U extends T>(obj: U) {
    for (const key in this.storage) {
      (this.storage[key] as Binding).addMasterBinding(obj, key);
    }
  }
}


// const BoundContructor = Bound;

// export default BoundContructor;
