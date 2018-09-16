# simple-bound
> A simple data binding library for node and browser with no dependencies.

[![Travis (.org) branch](https://img.shields.io/travis/KazanExpress/bound/master.svg?style=flat-square)](https://travis-ci.org/KazanExpress/bound)
[![npm](https://img.shields.io/npm/v/simple-bound.svg?style=flat-square)](https://www.npmjs.com/package/simple-bound)
[![](https://img.shields.io/badge/github-repo-lightgray.svg?style=flat-square)](https://github.com/KazanExpress/bound)
[![](https://img.shields.io/badge/dependencies-none-blue.svg?style=flat-square)](https://www.npmjs.com/package/simple-bound?activeTab=dependencies)
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

- [What is Bound?](#what-is-bound)
- [Installation](#installation)
- [Simple example](#simple-example)
- [How it works](#how-it-works)
- [API](#api)
  - [TLDR (examples)](#tldr)
  - [Binding](#binding)
    - [Constructor](#binding-constructor)
    - [Instance](#binding-instance)
    - [Static fields](#binding-static-fields)
  - [Bound](#bound)
    - [Constructor](#bound-constructor)
    - [Instance](#bound-instance)
    - [Static fields](#bound-static-fields)
- [Coming Soon](#coming-soon)


## What is Bound?

Bound is a small and customizable library that allows precise data binding management.

But what is data binding?

[Data binding](https://en.wikipedia.org/wiki/Data_binding) is a general technique that binds data sources of two general types (`provider` and `consumer`, `master` and `slave`) and syncronizes them.

For example, let's imagine two objects bound together using this technique:

```js
object1 /* {
  property: 'value'
} */

object2 /* {
  property: 'value'
} */

object1.property = 'new value'
console.log(object2.property) // outputs 'new value'

object2.property = 'another value'
console.log(object1.property) // outputs 'another value'
```

As we can see here, both objects seem to react to changes in one another, updating their properties reactively.

Most applications and frameworks use this approach to synchronize their models and views, as described in this [article](https://www.wintellect.com/data-binding-pure-javascript/).
But data-binding is not only useful for synchronizing views to models - there are a lot of applications as use-cases for this technique. And `Bound` aims to cover as most of them as possible.

It does not focus entirely on model-view data-binding, but rather tries to encapsulate the whole concept of data binding, allowing you to control where your bindings go and what your bindings do.

### General concepts

All "members" of the data-binding relationship can be called **subscribers**.
There are two general types of data flow between subscribers in data-binding: two-way (when both objects' properties react to each other, example above) and one-way.

In one-way data-binding there exist two types of binding subscribers:
 - "masters" - dictate changes to all other subscribers in the relationship.
 - "slaves" - accept changes from masters but cannot broadcast/dicate their own changes

`Bound` allows to handle both one-way and two-way data bindings with ease.

## Installation

### Install as dependency

```bash
npm install --save simple-bound
# or
yarn add simple-bound
```

### Import and use

**ES**
```js
import Bound from 'simple-bound'
```

**CommonJS**
```js
const Bound = require('simple-bound').default;
```

**Script tag**
```html
<script src="https://unpkg.com/simple-bound" onload="window.Bound = bound.default"></script>
```

## Simple example

Let's say you want to bind two objects together in a way that a change to one object would automatically change the other.

It's very simple to do with `Bound`:

```js
const obj1 = {
  prop: 'foo'
};

const obj2 = {
  prop: 'foo'
};

// Send the proto object to snapshot the structure.
const bound = new Bound(obj1 /* Used for snapshoting the object structure, not for the actual binding */);

// Bind both objects via Bound instance:
bound.bind(obj1);
bound.bind(obj2);

obj1.prop = 'bar';
console.log(obj2.prop);
// -> "bar"
// Magic!
```


## How it works

### Binding relationships

Each time a [new binding relationship](#binding) is created, the data is stored inside that relationship. After that, subscribers can be added to the relationship.

Each "master" subscriber's value points to the value inside the relationship, therefore automatically sharing it with others:
```js
let obj = { test: 'foo' };
let obj2 = { test: 'foo' };

const binding = new Binding(/* twoWay */ true, /* defaultValue */ '');

binding.addSubscriber(obj, 'test');
binding.addSubscriber(obj2, 'test');

// Now both obj.test and obj2.test point to the same variable inside `binding`
```

Each "slave" subscriber's value remains within its original container, but is updated whenever a __master__'s value changes via a [notification](#binding-instance):
```js
let obj = { test: 'foo' };
let obj2 = { test: 'foo' };

const binding = new Binding(/* twoWay */ false, /* defaultValue */ '');

binding.addSubscriber(obj, 'test', 'master');
binding.addSubscriber(obj2, 'test', 'slave');

obj2.test = 'bar'; // Nothing happens here, obj.test is still 'foo'

obj.test = 'new value'; // Notification is sent to obj2, updating its `test` property to 'new value'
```

### Object relationships

The ['Bound`](#bound) class groups relationships together in a form of an object to subscribe all of their fields to changes.

Essentially, it maps all bound object's properties to their [binding relationships](#binding) using internal [storage](#bound-instance) that contains these relationships in a map identical to the object itself.

## API

### TLDR

<details><summary>Click to expand</summary>

```js
import Bound, {
  bound,
  Binding
} from 'simple-bound';

// Creates a Bound instance from an object snapshot
const bound = new Bound({
  test: 'foo',
  nested: {
    property: 2
  }
});

bound.boundObject // The first actual bound object.
bound.storage // Stores bindings in a structure identical to the original object.


let obj = {
  test: 'foo'
}

let obj2 = {
  test: 'foo'
}

// Creates a Bound instance from the object and returns instance.boundObject
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

binding.removeSubscriber(obj2); // By object reference
binding.removeSubscriber(0); // By index
binding.clearSubscribers();
```

</details>

### Binding
> Stores and updates single property bindings.

Can be thought of as a primitive in terms of data-binding.
Its main responsibility is to manage single-property bindings, hence the name - `Binding` as in "one, single binding".

Creation of a `Binding` instance is equivalent to the creation of a new data-binding relationship.
Each newly added member "subscribes" to notifications about changes in the relationship's value.

#### Binding Constructor
```js
new Binding(/* is always two-way */ false, /* default initial value */ 'value')
```

argument     | type      | description
-------------|-----------|--------------
twoWay       | `boolean` | Determines if all the bindings associated with the instance should be two-way
defaultValue | `any`     | Sets the default value for subscribers that do not have a value.

## Coming Soon

  - Full documentation
  - Plugins
  - Event listeners
  - Interceptors and pipes (maybe?)
