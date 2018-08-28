import Binding, { IBindingSource, BindingRole } from './binding';

export interface IElementBindingSource extends IBindingSource<HTMLElement> {
  event?: keyof WindowEventMap;
}

export default class ElementBinding<T = any> extends Binding<T> {
  public bindings: IElementBindingSource[] = [];

  // TODO: something needs to be done about this (hint: remove ts-ignore to see)
  // @ts-ignore - because IDK how to resolve such a stupid error
  public addBinding<B extends HTMLElement = HTMLElement>(
    obj: B,
    prop: Exclude<keyof B, symbol>,
    role?: BindingRole,
    event?: keyof WindowEventMap
  ) {
    if (event && role === 'slave') {
      obj.addEventListener(event, this.set.bind(this, obj[prop]));
    }

    return super.addBinding(obj, prop, role);
  }

  // public addBinding(obj: HTMLElement, prop: string, role?: BindingRole, event?: keyof WindowEventMap) {

  // }
}
