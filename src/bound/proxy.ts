import BaseBound from '@/bound/base';

export class ProxyBound<T extends object> extends BaseBound<T> {
  public bindings: ProxyHandler<T>[] = [];
}
