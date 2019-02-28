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

```bash
npm i -S @widgetjs/tree
```

## Usage

### React/Vue usage

```js
import Tree from '@widgetjs/tree';
```

### VanillaJS usage

```html
<script src="path/to/tree.min.js"></script>
```

## Initialize

`new Tree(treeContainer, parameters)`, returns initialized Tree instance.

* `treeContainer` - string - css selector of the tree container(`document.querySelector` inside).
* `parameters` - object - options of the tree.

For example:

```js
var myTree = new Tree('#container', {
  url: '/api/treeJson',
});
```

## Basic Node Format

```json
{
  "id": "unique_ID",
  "text": "node-0",
  "attributes": {},
  "children": [],
  "check": true
}
```

| Name       | Type    | Description                         | Required |
| ---------- | ------- | ----------------------------------- | -------- |
| id         | any     | unique id                           | Required |
| text       | string  | tree node label                     | Required |
| attributes | object  | custom attributes of the node       | Optional |
| children   | array   | children of current node            | Optional |
| check      | boolean | whether the node is selected or not | Optional |

## Parameters

| Name       | Type     | Description                                                         |
| ---------- | -------- | ------------------------------------------------------------------- |
| url        | string   | a URL to retrieve remote data,or use `data`                         |
| method     | string   | http method(GET/POST), default 'GET'                                |
| data       | array    | the json tree data                                                  |
| values     | array    | ids which you want to check                                         |
| closeDepth | integer  | expand level                                                        |
| beforeLoad | function | invoke before the tree load data. Format raw data in this function. |
| loaded     | function | invoke after the tree load data                                     |
| onChange   | function | invoke when the node status change                                  |

Example

```js
var myTree = new Tree('#container', {
  url: '/api/treeJson',
  method: 'GET',

  values: ['1', '2', '3'],

  // only expand level 1 node
  closeDepth: 1,

  beforeLoad: function(rawData) {
    function formatData() {
      // do some format
    }
    return formatData(rawData);
  },

  loaded: function() {
    // do something or set values after Tree loaded callback
    // do not use arrow function `()=>` , if you use `this`, use function instead.
    // this context bind current tree instance
    this.values = ['0-1'];
  },

  onChange: function() {
    console.log(this.values);
  },
});
```

## Properties

| Property      | Type  | Operation | Description                                |
| ------------- | ----- | --------- | ------------------------------------------ |
| values        | array | get/set   | selected values.                           |
| selectedNodes | array | get       | selected nodes data with attributes.       |
| disables      | array | get/set   | get disabled values, or set disable nodes. |
| disabledNodes | array | get       | disabled nodes data with attributes.       |

### myTree.values

```js
// get
var values = myTree.values;

// set
tree.values = ['0-1'];
```

### myTree.selectedNodes

```js
// get
var selectedNodes = myTree.selectedNodes;
```

### myTree.disables

```js
// get
var disables = myTree.disables;

// set
tree.disables = ['0-1'];
```

### myTree.disabledNodes

```js
// get
var disabledNodes = myTree.disabledNodes;
```

## Events

| Event      | Parameters   | Description                        |
| ---------- | ------------ | ---------------------------------- |
| beforeLoad | current data | invoke before the tree load data   |
| loaded     | null         | invoke after the tree load data    |
| onChange   | null         | invoke when the node status change |

## Examples

```js
var treeData = [
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

var myTree = new Tree('#container', {
  data: treeData,
});

var myTree = new Tree('#container', {
  url: '/api/treeWithCheckedStatusJson',
});
```

---

Like @widgetjs/tree? just 🌟 star the project!
[Create issues](https://github.com/daweilv/treejs/issues) if you find bug.
