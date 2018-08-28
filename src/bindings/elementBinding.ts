import Binding, { IBindingSource, BindingRole } from './binding';

export interface IElementBindingSource extends IBindingSource<HTMLElement> {
  event?: keyof WindowEventMap;
}

export default class ElementBinding<T = any> extends Binding<T> {
  public bindings: IElementBindingSource[] = [];

  public addBinding<B extends HTMLElement = HTMLElement>(
    obj: B,
    prop: Exclude<keyof B, symbol | number>,
    role?: BindingRole,
    event?: keyof WindowEventMap
  ) {
    if (event && role === 'master') {
      obj.addEventListener(event, e => e.target && this.set.call(this, e.target[prop as string]));

      // this.bind({ obj, prop, role });

      // return this;
    }

    return super.addBinding(obj, prop, role);
  }
}
