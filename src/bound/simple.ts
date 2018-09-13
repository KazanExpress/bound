import Binding from '@/binding';
import BaseBound, { IBindingStorage } from '@/bound/base';

export type ISimpleBindingStorage<T extends object> = {
  [key in keyof T]: T[key] extends object ? T[key] : Extract<Binding<T[key]>, IBindingStorage<T>[key]>;
};

export class SimpleBound<T extends object> extends BaseBound<T> {
  public storage: ISimpleBindingStorage<T> = {} as any;

  public constructor(obj: T) {
    super();

    const original = JSON.parse(JSON.stringify(obj));

    for (const key in original) {
      if (typeof original[key] === 'object') { // If the value is object - then treat it like another bound target
        this.bound[key] = new SimpleBound(original[key] as any).bound;
      } else {
        const binding = new Binding(true, original[key]);
        binding.addMasterBinding(this.bound, key as string);

        this.storage[key] = binding;
      }
    }
  }
}

const test = new SimpleBound({
  test: 'foo'
});

test.storage.test.;
