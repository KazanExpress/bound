import packageInfo from '@/../package.json';

export type BindingRole = 'slave' | 'master';

export interface IBindingSource<T extends object = object> {
  obj: T;
  prop: string | number;
  role?: BindingRole;
}

export interface IBindingConfig {
  debug: boolean;
}

export const defaultBindingConfig: IBindingConfig = {
  debug: false
};

export default class Binding<T = any> {
  private bind(binding: IBindingSource) {
    if (this.bindings.every(b => !Binding.sourcesEqual(b, binding))) {
      this.bindings.push(binding);
    } else if (Binding.config.debug) {
      console.info(`[${packageInfo.name}]: binding for ${binding.prop} is already declared.`);
    }

    return binding;
  }

  protected value: T;

  public readonly bindings: IBindingSource[] = [];
  public readonly twoWay: boolean;
  public readonly get = function (this: Binding<T>) {
    return this.value;
  };
  public readonly set = function (this: Binding<T>, newValue: T) {
    this.value = newValue;
    this.bindings.forEach(binding => {
      if (binding.role !== 'master') {
        binding.obj[binding.prop] = newValue;
      }
    });
  };

  constructor(twoWay: boolean, initialValue: T) {
    this.twoWay = twoWay || false;
    this.value = initialValue;
  }

  public get lastBinding() {
    return this.bindings[this.bindings.length - 1];
  }

  public addMasterBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addMasterBinding(obj: any, prop: string | number) {
    if (obj[prop]) {
      this.set(obj[prop] as any);
    } else {
      obj[prop] = this.get();
    }

    const binding = this.bind({ obj, prop, role: 'master' });

    Object.defineProperty(obj, prop, {
      get: this.get.bind(this),
      set: this.set.bind(this),
      enumerable: true
    });

    return binding;
  }

  public addSlaveBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addSlaveBinding(obj: any, prop: string | number) {
    obj[prop] = this.get();

    return this.bind({ obj, prop, role: 'slave' });
  }

  public addBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>, role?: BindingRole);
  public addBinding(obj: any, prop: string | number, role?: BindingRole) {
    if (this.twoWay || role === 'master') {
      this.addMasterBinding(obj, prop);
    } else {
      this.addSlaveBinding(obj, prop);
    }

    return this;
  }

  public removeBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>): this;
  public removeBinding(index: number): this;
  public removeBinding() {
    let index;

    if (typeof arguments[0] === 'number') {
      index = arguments[0];
    } else {
      const obj = arguments[0];
      const prop = arguments[1];

      index = this.bindings.findIndex(b => Binding.sourcesEqual(b, { obj, prop }));
    }
    this.bindings.splice(index, 1);

    return this;
  }

  public clearBindings() {
    this.bindings.splice(0);

    return this;
  }


  public static readonly config = defaultBindingConfig;
  public static readonly sourcesEqual = (
    src1: IBindingSource | undefined, src2: IBindingSource | undefined
  ) => !!src1 && !!src2 && src1.prop === src2.prop && src1.obj === src2.obj;
}
