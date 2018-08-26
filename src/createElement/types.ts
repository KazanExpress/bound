export type CreateElement<T extends string = keyof HTMLElementTagNameMap> = {
  (tag: T, children?: INodeChildren): HTMLElement;
  (tag: T, data?: INodeData, children?: INodeChildren): HTMLElement;
};

export type ScopedSlot = (props: any) => INodeChildrenArrayContents | string;

export type INodeChildren = INodeChildrenArrayContents | [ScopedSlot] | string;
export interface INodeChildrenArrayContents
  extends Array<INode | string | INodeChildrenArrayContents> {}

export interface INode<T extends HTMLElement = HTMLElement> {
  tag?: string;
  data?: INodeData;
  children?: INode[];
  text?: string;
  elm?: Node;
  ns?: string;
  context?: T;
  key?: string | number;
  componentOptions?: INodeComponentOptions;
  componentInstance?: T;
  parent?: INode;
  raw?: boolean;
  isStatic?: boolean;
  isRootInsert: boolean;
  isComment: boolean;
}

export interface INodeComponentOptions<T extends typeof HTMLElement = typeof HTMLElement> {
  Ctor: T;
  propsData?: object;
  listeners?: object;
  children?: INodeChildren;
  tag?: string;
}

export interface INodeData {
  key?: string | number;
  slot?: string;
  scopedSlots?: { [key: string]: ScopedSlot };
  ref?: string;
  tag?: string;
  staticClass?: string;
  class?: any;
  staticStyle?: { [key: string]: any };
  style?: object[] | object;
  props?: { [key: string]: any };
  attrs?: { [key: string]: any };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Function[] };
  nativeOn?: { [key: string]: Function | Function[] };
  transition?: object;
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Function[];
  };
  directives?: INodeDirective[];
  keepAlive?: boolean;
}

export interface INodeDirective {
  readonly name: string;
  readonly value: any;
  readonly oldValue: any;
  readonly expression: any;
  readonly arg: string;
  readonly modifiers: { [key: string]: boolean };
}
