import Binding from '@/binding';

export const hasProxy = ('Proxy' in window) || !!Proxy;

type IBIndingStorage<T extends object> = {
  [key in keyof T]: ProxyHandler<T> | Binding<T[key]> | T[key];
};

export default abstract class BaseBound<T extends object> {
  protected storage: IBIndingStorage<T> = {} as any;
  public bound = { __bound__: this } as T & { __bound__: BaseBound<T> };

  public bind<U extends T>(obj: U) {
    for (const key in this.storage) {
      (this.storage[key] as Binding).addMasterBinding(obj, key);
    }
  }
}


// const BoundContructor = Bound;

// export default BoundContructor;
