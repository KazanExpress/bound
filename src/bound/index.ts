import SimpleBound from './simple';

export function bound<T extends object>(target: T): T {
  return new SimpleBound(target).bound;
}

export {
  default,
  ISimpleBindingStorage
} from './simple';

export {
  default as Binding,
  BindingRole,
  IBindingAction,
  IBindingPlugin,
  ISubscriber
} from '../binding';

export {
  default as BoundBase,
  IBindingStorage,
  IBoundAction,
  IBoundPlugin
} from './base';

export * from '@/config';
export * from '@/util';
export { default as BoundError } from '@/boundError';
