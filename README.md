# @widgetjs/tree

A lightweight tree widget, compatible with originaljs / react / vue. 5kb after gzip. Zero dependence.

[Online Demo](https://daweilv.github.io/treejs/)

![demo.gif](https://daweilv.github.io/treejs/demo.gif)

# Install

`npm i -S @widgetjs/tree`

# Usage

### react/vue usage

```js
import Tree from '@widgetjs/tree';
```

### originaljs usage

```html
<script src="${your-asset-src-path}/@widgetjs/tree/dist/tree.min.js"></script>
```

# Example

```js
// format
{"id":"unique_ID","text":"node-0","attributes":{},"children":[],"check":true/false}
```

```js
let treeData = [{"id":"0","text":"node-0","children":[{"id":"0-0","text":"node-0-0","children":[{"id":"0-0-0","text":"node-0-0-0"},{"id":"0-0-1","text":"node-0-0-1"},{"id":"0-0-2","text":"node-0-0-2"}]},{"id":"0-1","text":"node-0-1"}]},{"id":"1","text":"node-1","children":[{"id":"1-0","text":"node-1-0"},{"id":"1-1","text":"node-1-1"}]}];

new Tree('#container', {
  data: treeData,
  // only expand level 1 node
  closeDepth: 1
});

new Tree('#container', {
  data: treeData,
  onChange: function() {
      console.log(this.values);
  }
});

new Tree('#container', {
  data: treeData,
  values: ['1', '2', '3']
});

new Tree('#container', {
  url: '/api/treeJson',
  values: ['1', '2', '3']
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
  data: treeData
  values: ['1', '2', '3']
});
// get values of selected leaves
let values = tree.values;

// set selected nodes(parent node or leaf node)
tree.values = ["0-1"];

// get all selected nodes with attributes
let selectedNodes = tree.selectedNodes;

// get values of disabled leaves
let disables = tree.disables;

// set disabled nodes(parent node or leaf node), disabled nodes will be readonly and unchangeable.
tree.disables = ["0-1"];

// get all disabled nodes with attributes
let disabledNodes = tree.disabledNodes;
```
