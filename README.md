# @widgetjs/tree

[![NPM version](https://img.shields.io/npm/v/@widgetjs/tree.svg?style=flat-square)](https://npmjs.org/package/@widgetjs/tree)
[![David deps](https://img.shields.io/david/daweilv/treejs.svg?style=flat-square)](https://david-dm.org/daweilv/treejs)
[![npm downloads](https://img.shields.io/npm/dm/@widgetjs/tree.svg?style=flat-square)](https://www.npmjs.com/package/@widgetjs/tree)
[![gzip size](https://flat.badgen.net/bundlephobia/minzip/@widgetjs/tree)](https://bundlephobia.com/result?p=@widgetjs/tree)

A lightweight tree widget.

## Features

* Compatible with VanillaJS / React / Vue
* Tiny size after gzip
* Zero dependence

## Demo

[Online Demo](https://daweilv.github.io/treejs/)

![demo.gif](https://daweilv.github.io/treejs/demo.gif)

## Install

`npm i -S @widgetjs/tree`

## Usage

### React/Vue usage

```js
import Tree from '@widgetjs/tree';
```

### VanillaJS usage

```html
<script src="${your-asset-src-path}/@widgetjs/tree/dist/tree.min.js"></script>
```

## Properties & Methods

### tree.values

get or set the values array of selected leaves.

```js
// get
const values = tree.values;
// todo: show case

// set
tree.values = ['0-1'];
```

### tree.selectedNodes

get the selectedNodes data (with attributes).

```js
// get
let selectedNodes = tree.selectedNodes;
// todo: show case
```

### tree.disables

get the values array of disabled leaves, or disable the nodes. The disabled nodes will be readonly and unchangeable

```js
// get
let disables = tree.disables;
// todo: show case

// set
tree.disables = ['0-1'];
```

### tree.disabledNodes

get all disabled nodes with attributes

```js
// get
let disabledNodes = tree.disabledNodes;
// todo: show case
```

### tree.beforeLoad
### tree.loaded
### tree.onChange

## Example

```json
{
  "id": "unique_ID",
  "text": "node-0",
  "attributes": {},
  "children": [],
  "check": true
}
```

```js
let treeData = [
  {
    id: '0',
    text: 'node-0',
    children: [
      {
        id: '0-0',
        text: 'node-0-0',
        children: [
          {id: '0-0-0', text: 'node-0-0-0'},
          {id: '0-0-1', text: 'node-0-0-1'},
          {id: '0-0-2', text: 'node-0-0-2'},
        ],
      },
      {id: '0-1', text: 'node-0-1'},
    ],
  },
  {
    id: '1',
    text: 'node-1',
    children: [{id: '1-0', text: 'node-1-0'}, {id: '1-1', text: 'node-1-1'}],
  },
];

new Tree('#container', {
  data: treeData,
  // only expand level 1 node
  closeDepth: 1,
});

new Tree('#container', {
  data: treeData,
  onChange: function() {
    console.log(this.values);
  },
});

new Tree('#container', {
  data: treeData,
  values: ['1', '2', '3'],
});

new Tree('#container', {
  url: '/api/treeJson',
  values: ['1', '2', '3'],
});

new Tree('#container', {
  url: '/api/rawData',
  beforeLoad: rawdata => {
    let formatedData = rawdata; // do some format
    return formatedData;
  },
  values: ['1', '2', '3'],
});

new Tree('#container', {
  url: '/api/treeJson',
  loaded: function() {
    // do something or set values after Tree loaded callback
    // this context bind current tree instance
    let treeJson = [];
    this.values = treeJson;
  },
});

new Tree('#container', {
  url: '/api/treeWithCheckedStatusJson',
});

let tree = new Tree({
  data: treeData,
  values: ['1', '2', '3'],
});
```
