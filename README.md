# bound
> A simple and customizable reactive binding framework. Work in progress.

[![npm](https://img.shields.io/npm/v/simple-bound.svg?style=flat-square)](https://www.npmjs.com/package/simple-bound)
[![](https://img.shields.io/badge/github-repo-lightgray.svg?style=flat-square)](https://github.com/KazanExpress/bound)
[![npm](https://img.shields.io/npm/dt/simple-bound.svg?style=flat-square)](https://www.npmjs.com/package/simple-bound)

## Why?

Many JavaScript libraries and frameworks use some form of data-binding under the hood. That binding usually comes in various shapes and sizes, all of which end up in the "vendor" part of your project. But currently there's no truly utilitary and versatile solution. So most of the time you want to use the power of, let's say, two-way binding in you own library or project - you have to code that part from scratch.

`Bound` aims to change that.

`Bound` is currently in the alpha state, there might be ~~some~~ a lot of bugs. Feel free to report them in the [issues section](https://github.com/KazanExpress/bound/issues/new). 🙂


## Table of contents

- [What is data-binding?](#what-is-data-binding)
- [Simple example](#simple-example)
- [Installation](#installation)
- [Build](#build-setup)
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


## What is data binding

