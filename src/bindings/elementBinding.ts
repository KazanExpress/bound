import Binding, { IBindingSource, BindingRole } from './binding';

export interface IElementBindingSource extends IBindingSource<HTMLElement> {
  event?: keyof WindowEventMap;
}

export default class ElementBinding<T = any> extends Binding<T> {
  public bindings: IElementBindingSource[] = [];

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
}
