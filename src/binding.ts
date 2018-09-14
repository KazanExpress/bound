import BoundError from './boundError';
import config from './config';

export type BindingRole = 'slave' | 'master';

export interface ISubscriber<T extends object = object> {
  obj: T;
  prop: string | number;
  role?: BindingRole;
}

export interface IBindingAction {
  type: 'get' | 'set';
  subscribers: ISubscriber[];
}

export type IBindingPlugin<T = any> = (
  value: T,
  action: IBindingAction
) => void;

export default class Binding<T = any> {
  private callPlugins(type: 'get' | 'set') {
    if (this.plugins) {
      this.plugins.forEach(plugin => plugin(this.value, Object.freeze({
        type,
        subscribers: this.subscribers
      })));
    }
  }

  protected bind(subscriber: ISubscriber) {
    if (this.subscribers.every(b => !Binding.sourcesEqual(b, subscriber))) {
      this.subscribers.push(subscriber);
    } else if (Binding.config.debug) {
      throw new BoundError(`Binding for ${subscriber.prop} is already declared.`);
    }

    return subscriber;
  }

  public readonly subscribers: ISubscriber[] = [];

  constructor(
    public readonly twoWay: boolean,
    protected value: T,
    public readonly plugins?: IBindingPlugin<T>[]
  ) { }

  public get() {
    this.callPlugins('get');

    return this.value;
  }

  public set(newValue: T) {
    // Bind value for all masters at once
    this.value = newValue;

    // Then notify all slaves about the change
    this.notify(newValue);

    // Then call plugins
    this.callPlugins('set');
  }

  public async notify(newValue: T) {
    this.subscribers.forEach(async binding => {
      if (binding.role !== 'master') { // Set value for each slave
        binding.obj[binding.prop] = newValue;
      }
    });
  }

  public addMasterSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addMasterSubscriber(obj: any, prop: string | number) {
    return this.addSubscriber(obj, prop, 'master');
  }

  public addSlaveSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addSlaveSubscriber(obj: any, prop: string | number) {
    return this.addSubscriber(obj, prop, 'slave');
  }

  public addSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>, role?: BindingRole);
  public addSubscriber(obj: any, prop: string | number, role?: BindingRole) {
    if (this.twoWay || role === 'master') {
      if (obj[prop] !== undefined) {
        this.set(obj[prop] as any);
      } else {
        obj[prop] = this.get();
      }

      this.bind({ obj, prop, role: 'master' });

      // TODO: account for a case of having enumerable get/set on a prop instead of normal value
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

  public removeSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>): this;
  public removeSubscriber(index: number): this;
  public removeSubscriber() {
    let index = -1;

    if (typeof arguments[0] === 'number') {
      index = arguments[0];
    } else {
      const obj = arguments[0];
      const prop = arguments[1];

      index = this.subscribers.findIndex(b => Binding.sourcesEqual(b, { obj, prop }));
    }


    if (index !== -1) {
      // Also remove getters and setters
      if (this.subscribers[index].role === 'master') {
        Object.defineProperty(this.subscribers[index].obj, this.subscribers[index].prop, {
          value: this.value,
          writable: true
        });
      }
      this.subscribers.splice(index, 1);
    }

    return this;
  }

  public clearSubscribers() {
    this.subscribers.splice(0);

    return this;
  }


  public static get config() { return config; }
  public static readonly sourcesEqual = (
    src1: ISubscriber | undefined, src2: ISubscriber | undefined
  ) => !!src1 && !!src2 && src1.prop === src2.prop && src1.obj === src2.obj;
}
