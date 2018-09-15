import BoundError from './boundError';
import config from './config';

/**
 * Defines a role of a subscriber.
 *
 * 'master' -> updates all masters & all slaves.
 *
 * 'slave' -> does not update any subscriber.
 */
export type SubscriberRole = 'slave' | 'master';

/**
 * An internal interface for storing the subscribers
 */
export interface ISubscriber<T extends object = object> {
  /**
   * Stores a reference to subscribed object
   */
  obj: T;

  /**
   * Stores a key by which the subscribed property is get
   */
  prop: string | number;

  /**
   * The role of a subscriber
   *
   * 'master' -> updates all masters & all slaves (two-way bindings).
   *
   * 'slave' -> does not update any subscriber (one-way bindings).
   */
  role?: SubscriberRole;
}

/**
 * A type for a general Binding plugin function
 */
export type IBindingPlugin<T = any> = (
  value: T,
  action: {
    type: 'get' | 'set';
    subscribers: ISubscriber[];
  }
) => void; // TODO: make interceptors - (value, action) => finalValue as T;


/**
 * Binding is responsible for binding objects' properties together, storing their values inside and updating subscribers.
 *
 * It helps to manipulate the bindings on the lowest possible level.
 *
 * It only binds a SINGLE property at a time!
 *
 * @template T captures a type of property to bind. Once the class is initialied - only properties of types that extend T are allowed for binding.
 */
export default class Binding<T = any> {
  /**
   * Responsible for executing the plugins synchronyously,
   *
   * @param type describes the type of action to be transmitted to a plugin
   */
  private callPlugins(type: 'get' | 'set') {
    if (this.plugins) {
      this.plugins.forEach(plugin => plugin(this.value, Object.freeze({
        type,
        subscribers: this.subscribers
      })));
    }
  }

  /**
   * Adds a subscriber to the list of subscribers.
   *
   * @param subscriber to add
   */
  protected bind(subscriber: ISubscriber) {
    if (this.subscribers.every(b => !Binding.subscriptionsEqual(b, subscriber))) {
      this.subscribers.push(subscriber);
    } else if (Binding.config.debug) {
      throw new BoundError(`Binding for ${subscriber.prop} is already declared.`);
    }

    return subscriber;
  }

  /**
   * Stores subscribers on change-events for further manipulations.
   */
  public readonly subscribers: ISubscriber[] = [];

  /**
   * Creates an instance of Binding.
   * @param twoWay defines if a binding should always be 2-way and ignore roles.
   * @param value initial value to assign to slave bindings.
   * @param [plugins] to call on events.
   */
  constructor(
    public readonly twoWay: boolean,
    protected value: T,
    public readonly plugins?: IBindingPlugin<T>[]
  ) { }

  /**
   * A generic get function that is applied to subscribers.
   *
   * Can also be used to get the current binding value.
   */
  public get() {
    this.callPlugins('get');

    return this.value;
  }

  /**
   * A generic set function that is applied to subscribers.
   *
   * Can also be used to set the current binding value.
   */
  public set(newValue: T) {
    // Bind value for all masters at once
    this.value = newValue;

    // Then notify all slaves about the change
    this.notify(newValue);

    // Then call plugins
    this.callPlugins('set');
  }

  /**
   * Asynchroniously notifies the subscribers about the value change.
   *
   * @param newValue is the value to set to subscribers' properties.
   */
  public async notify(newValue: T) {
    this.subscribers.forEach(async subscriber => {
      if (subscriber.role !== 'master') { // Set value for each slave
        subscriber.obj[subscriber.prop] = newValue;
      }
    });
  }

  /**
   * Binds an object prop and subscribes it to master-subscribers' changes
   *
   * @param obj is an object to take the value from.
   * @param prop key to get the value by.
   * @param role a role to give to the subscriber.
   */
  public addSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>, role?: SubscriberRole);
  public addSubscriber(obj: any, prop: string | number, role?: SubscriberRole) {
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

  /**
   * Binds an object prop as a master and subscribes it to master-subscribers' changes
   *
   * @param obj is an object to take the value from.
   * @param prop key to get the value by.
   */
  public addMasterSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addMasterSubscriber(obj: any, prop: string | number) {
    return this.addSubscriber(obj, prop, 'master');
  }

  /**
   * Binds an object prop as a slave and subscribes it to master-subscribers' changes
   *
   * @param obj is an object to take the value from.
   * @param prop key to get the value by.
   */
  public addSlaveSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>);
  public addSlaveSubscriber(obj: any, prop: string | number) {
    return this.addSubscriber(obj, prop, 'slave');
  }


  /**
   * Unbinds an object's property and unsubscribes it from changes.
   *
   * @param obj is an object to find the value in.
   * @param prop key to get the value by.
   */
  public removeSubscriber<B extends object>(obj: B, prop: Exclude<keyof B, symbol>): this;
  /**
   * Unbinds an object's property and unsubscribes it from changes.
   *
   * @param index an index to find the subscribber by.
   */
  public removeSubscriber(index: number): this;
  public removeSubscriber() {
    let index = -1;

    if (typeof arguments[0] === 'number') {
      index = arguments[0];
    } else {
      const obj = arguments[0];
      const prop = arguments[1];

      index = this.subscribers.findIndex(b => Binding.subscriptionsEqual(b, { obj, prop }));
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

  /**
   * Clears all subscribers from the binding.
   */
  public clearSubscribers() {
    this.subscribers.forEach((_, index) => this.removeSubscriber(index));

    return this;
  }


  /**
   * Global binding config. Changes affect all instances.
   */
  public static get config() { return config; }


  /**
   * Checks subscribers' objects for reference equality.
   */
  public static readonly subscriptionsEqual = (
    src1: ISubscriber | undefined, src2: ISubscriber | undefined
  ) => !!src1 && !!src2 && src1.prop === src2.prop && src1.obj === src2.obj;
}
