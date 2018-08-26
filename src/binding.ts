import packageInfo from '../package.json';

export interface IValueContainer {
  [key: string]: any;
}

export interface IBindingSource extends IValueContainer {
  prop: string;
  obj: IValueContainer;
}

export interface IBindingConfig {
  debug: boolean;
}

export const defaultBindingConfig: IBindingConfig = {
  debug: false
};

export default class Binding<T = any> {
  public static config: IBindingConfig = defaultBindingConfig;

  public static sourcesEqual(src1: IBindingSource, src2: IBindingSource) {
    return src1.prop === src2.prop && src1.obj === src2.obj;
  }

  protected value: T;

  constructor(propName: string, freshValue?: T)
  constructor(bound: IValueContainer, propName: keyof typeof bound, freshValue?: T)
  constructor() {
    if (typeof arguments[0] === 'string') {
      var bound = {};
      var propName = arguments[0];
      var freshValue = arguments[1];
    } else {
      [bound, propName, freshValue] = arguments;
    }

    if (freshValue) {
      bound[propName] = freshValue;
    }

    this.value = bound[propName];

    Object.defineProperty(bound, propName, {
      get: this.get.bind(this),
      set: this.set.bind(this),
      enumerable: true
    });

    bound[propName] = this.value;
  }

  public bindings: IBindingSource[] = [];

  public get lastBinding() {
    return this.bindings[this.bindings.length - 1];
  }

  public get() {
    return this.value;
  }

  public set(newValue: T) {
    this.value = newValue;
    this.bindings.forEach(binding => (binding.obj[binding.prop] = newValue));
  }

  public addBinding(obj: IValueContainer, prop: string) {
    const binding: IBindingSource = {
      prop,
      obj
    };

    if (this.bindings.every(b => !Binding.sourcesEqual(b, binding))) {
      binding.obj[binding.prop] = this.value;
      this.bindings.push(binding);
    } else if (Binding.config.debug) {
      console.info(`[${packageInfo.name}]: binding for ${prop} is already declared.`);
    }

    return this;
  }

  public removeBinding(obj: IValueContainer, prop: string): this;
  public removeBinding(index: number): this;
  public removeBinding() {
    if (typeof arguments[0] === 'number') {
      const index = arguments[0];

      this.bindings = this.bindings.filter((b, i) => i !== index);
    } else {
      const obj = arguments[0];
      const prop = arguments[1];

      this.bindings = this.bindings.filter(b => !Binding.sourcesEqual(b, { obj, prop }));
    }

    return this;
  }
}
