import Binding from '@/binding';
import BaseBound from '@/bound/base';

export class SimpleBound<T extends object> extends BaseBound<T> {
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
