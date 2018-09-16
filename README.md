# bound
> A simple and customizable reactive binding framework for node and browser. Work in progress.

[![npm](https://img.shields.io/npm/v/simple-bound.svg?style=flat-square)](https://www.npmjs.com/package/simple-bound)
[![](https://img.shields.io/badge/github-repo-lightgray.svg?style=flat-square)](https://github.com/KazanExpress/bound)
[![npm](https://img.shields.io/npm/dt/simple-bound.svg?style=flat-square)](https://www.npmjs.com/package/simple-bound)

```bash
npm install --save simple-bound
```
For more options see [installation](#installation)

## Why?

Many JavaScript libraries and frameworks use some form of data-binding under the hood. That binding usually comes in various shapes and sizes, all of which end up in the "vendor" part of your project. But currently there's no truly utilitary and versatile solution. So most of the time you want to use the power of, let's say, two-way binding in you own library or project - you have to code that part from scratch.

`Bound` aims to change that.

`Bound` is currently in the alpha state, there might be ~~some~~ a lot of bugs. Feel free to report them in the [issues section](https://github.com/KazanExpress/bound/issues/new). 🙂


## Table of contents

- [What is data-binding?](#what-is-data-binding)
- [Installation](#installation)
- [Simple example](#simple-example)
- [API](#api)
  - [TLDR (examples)](#tldr)
  - [Bound](#bound)
    - [Constructor](#constructor)
    - [Instance](#bound-instance)
    - [Static fields](#static-fields)
  - [Binding](#binding)
    - [Constructor](#constructor)
    - [Instance](#bound-instance)
    - [Static fields](#static-fields)
- [Details & under-the hood](#details)
- [Coming Soon](#coming-soon)


## [What is data binding](https://www.wintellect.com/data-binding-pure-javascript/)

## Installation & Usage

### Install as dependency

```bash
npm install --save simple-bound
# or
yarn add simple-bound
```

### Import and use

**ES**
```js
import Bound from 'bound'
```

**CommonJS**
```js
const Bound = require('bound').default;
```

**UNPKG**
```html
<script src="https://unpkg.com/simple-bound"></script>
<script>
  window.Bound = bound.default;
</script>
```

## Simple example

Let's say you want to bind to objects together in a way that a change to one object would change the other. It's very simple to do with `Bound`:

```js
const obj1 = {
  prop: 'foo'
};

const obj2 = {
  prop: 'foo'
};

// Send the proto object to snapshot the structure.
const bound = new Bound(obj);

// Bind both objects via Bound instace:
bound.bind(obj1);
bound.bind(obj2);

obj1.prop = 'bar';
console.log(obj2.prop);
// -> "bar"
// Magic!
```

## API

### TLDR

<!-- <details><summary>Click to expand</summary> -->

```js
import Bound, {
  bound,
  Binding
} from 'bound';

let obj = {
  test: 'foo';
}

let obj2 = {
  test: 'foo';
}

const justABoundObject = bound({
  test: 'prop'
});

justABoundObject.__bound__ // Bound instance
justABoundObject.__bound__.bind(obj);

justABoundObject.test = 'bar';
console.log(obj.test); // -> "bar"

justABoundObject.__bound__.storage // { test: Binding {} }
justABoundObject.__bound__.boundObject // === justABoundObject

obj = justABoundObject.__bound__.unbind(obj); // obj is now free from bindings


// Binding class
const binding = new Binding(/* twoWay */ false, /* defaultValue */ '');

binding.addSubscriber(obj, 'test', 'master');
binding.addSubscriber(obj2, 'test', 'slave');

// Updates all subscribers
binding.set('test'); // obj.test === 'test' && obj2.test === 'test'

// Master: updates all subscribers
obj.test = 'foo';    // obj2.test === 'foo' && binding.get() === 'foo'

// Slave: updates only itself
obj2.test = 'bar';   // obj.test === 'foo' && binding.get() === 'foo'

// Master: updates all subscribers
obj.test = 'baz';    // obj2.test === 'baz' && binding.get() === 'baz'

binding.removeBinding(obj2); // By object reference
binding.removeBinding(0); // By index
binding.clearBindings();
```

<!-- </details> -->

## Coming Soon

  - Full documentation
  - Plugins
  - Event listeners
  - Interceptors and pipes (maybe?)
