import Binding, { IBindingSource } from './binding';

export interface IElementBindingSource extends IBindingSource {
  obj: HTMLElement;
  event?: keyof WindowEventMap;
}

export class ElementBinding<T = any> extends Binding<T> {
  public bindings: IElementBindingSource[] = [];

  public addBinding(obj: HTMLElement, prop: string, event?: keyof WindowEventMap) {
    if (event && ElementBinding.sourcesEqual({ obj, prop }, this.lastBinding)) {
      obj.addEventListener(event, this.set.bind(this, obj[prop]));
    }

    return super.addBinding(obj, prop);
  }
}
