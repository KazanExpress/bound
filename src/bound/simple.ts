import Binding from '@/binding';
import BaseBound, { IBindingStorage, fromPath } from '@/bound/base';

export type ISimpleBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? ISimpleBindingStorage<T[key]> : Extract<Binding<T[key]>, IBindingStorage<T>[key]>;
};

export class SimpleBound<T extends object> extends BaseBound<T> {
  public storage: ISimpleBindingStorage<T> = {} as any;

  public constructor(obj: T) {
    super();

    const original = JSON.parse(JSON.stringify(obj));

    for (const key in original) {
      if (typeof original[key] === 'object') { // If the value is object - then treat it like another bound target
        const bound = new SimpleBound(original[key] as any);
        this.bound[key] = bound.bound;
        this.storage[key] = bound.storage;
      } else {
        const binding = new Binding(true, original[key]);
        binding.addMasterBinding(this.bound, key as string);

        this.storage[key] = binding;
      }
    }
  }

  public bind<U extends T>(obj: U, path: string = '') {
    for (const key in fromPath(this.storage, path)) {
      if (this.storage[key] instanceof Binding) {
        (this.storage[key] as Binding).addMasterBinding(obj, key);
      } else {
        this.bind(obj[key], !path ? key : `${path}.${key}`);
      }
    }
  }
}

const b = new SimpleBound({
  test: 'foo',
  internal: {
    another: 'bar',
    b: 2
  }
});

const obj2 = {
  test: 'foo',
  internal: {
    another: 'bar',
    b: 2
  }
};

b.bind(obj2);
