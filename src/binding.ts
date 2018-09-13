import packageInfo from '@/../package.json';

export type BindingRole = 'slave' | 'master';

export interface ISubscriber<T extends object = object> {
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
  protected bind(subscriber: ISubscriber) {
    if (this.subscribers.every(b => !Binding.sourcesEqual(b, subscriber))) {
      this.subscribers.push(subscriber);
    } else if (Binding.config.debug) {
      console.info(`[${packageInfo.name}]: binding for ${subscriber.prop} is already declared.`);
    }

    return subscriber;
  }

  protected value: T;

  public readonly subscribers: ISubscriber[] = [];
  public readonly twoWay: boolean;

  constructor(twoWay: boolean, initialValue: T) {
    this.twoWay = twoWay || false;
    this.value = initialValue;
  }

  public get() { return this.value; }

  public set(newValue: T) {
    // Bind value for all masters at once
    this.value = newValue;

    // Then notify all slaves about the change
    this.notify(newValue);
  }

  public notify(newValue: T) {
    this.subscribers.forEach(binding => {
      if (binding.role !== 'master') { // Set value for each slave
        binding.obj[binding.prop] = newValue;
      }
    });
  }

  // public addMasterBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addMasterBinding(obj: any, prop: string | number) {
    return this.addBinding(obj, prop, 'master');
  }

  // public addSlaveBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addSlaveBinding(obj: any, prop: string | number) {
    return this.addBinding(obj, prop, 'slave');
  }

  // public addBinding<B extends object>(obj: B, prop: Exclude<keyof B, symbol>, role?: BindingRole);
  public addBinding(obj: any, prop: string | number, role?: BindingRole) {
    if (this.twoWay || role === 'master') {
      if (obj[prop]) {
        this.set(obj[prop] as any);
      } else {
        obj[prop] = this.get();
      }

      this.bind({ obj, prop, role: 'master' });

      Object.defineProperty(obj, prop, {
        get: this.get.bind(this),
        set: this.set.bind(this),
        enumerable: true
      });
    } else {
      obj[prop] = this.get();

      this.bind({ obj, prop, role: 'slave' });
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

      index = this.subscribers.findIndex(b => Binding.sourcesEqual(b, { obj, prop }));
    }
    this.subscribers.splice(index, 1);

    return this;
  }

  public clearBindings() {
    this.subscribers.splice(0);

    return this;
  }


  public static readonly config = defaultBindingConfig;
  public static readonly sourcesEqual = (
    src1: ISubscriber | undefined, src2: ISubscriber | undefined
  ) => !!src1 && !!src2 && src1.prop === src2.prop && src1.obj === src2.obj;
}
