import { CreateElement } from './types';

export default (function createElement() {
  const tag: string = arguments[0];
  const [children, data] = ((...args: any[]) => {
    const dataArgIdx = 1;
    const childArgIdx = 2;
    if (args.length > childArgIdx) {
      return [args[childArgIdx], args[dataArgIdx]];
    }

    if (Array.isArray(args[1]) || typeof args[1] === 'string') {
      return [args[dataArgIdx], undefined];
    }

    return [undefined, undefined];
  })(...arguments);

  const element = document.createElement(tag);

  if (data)
    for (let key in data) {
      element[key] = data[key];
    }

  if (children) {
    if (Array.isArray(children)) {
      children.forEach(c => {
        if (typeof c === 'string') {
          element.innerHTML += c;
        } else if (c instanceof HTMLElement) {
          element.appendChild(c);
        } else if (Array.isArray(c)) {
          const [childTag, childText] = c;
          let child = document.createElement(childTag);
          child.innerHTML = childText;
          element.appendChild(child);
        }
      });
    } else {
      element.innerHTML = children;
    }
  }

  return element;
} as CreateElement);
