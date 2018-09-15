import Bound from './bound';

export function bound<T extends object>(target: T): T {
  return new Bound(target).boundObject;
}

export {
  default,
  ISimpleBindingStorage
} from './bound';

export {
  default as Binding,
  SubscriberRole,
  IBindingPlugin,
  ISubscriber
} from '../binding';

export {
  default as BoundBase,
  IBindingStorage,
  IBoundAction,
  IBoundPlugin
} from './base';

export * from '../config';
export * from '../util';
export { default as BoundError } from '../boundError';
