# treejs

# Install

```html
<link rel="stylesheet" href="/node_modules/dist/tree.min.css">
<script src="/node_modules/dist/tree.min.js"></script>
```

# Example

```js
// format
{"id":"unique_ID","text":"node-0","children":[],"attributes":{}}
```

```js
let treeData = [{"id":"0","text":"node-0","children":[{"id":"0-0","text":"node-0-0","children":[{"id":"0-0-0","text":"node-0-0-0"},{"id":"0-0-1","text":"node-0-0-1"},{"id":"0-0-2","text":"node-0-0-2"}]},{"id":"0-1","text":"node-0-1"}]},{"id":"1","text":"node-1","children":[{"id":"1-0","text":"node-1-0"},{"id":"1-1","text":"node-1-1"}]}];

new Tree('#container', {
  data: treeData
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
  loaded: () => {
    // to something or setValues() after Tree loaded callback
    let treeJson = [];
    this.values = treeJson;
  },
});

let tree = new Tree({
  data: treeData
  values: ['1', '2', '3']
});
// get values of selected leaves
let values = tree.values;
// get all selected nodes with individual data you send
let selectedNodes = tree.selectedNodes;
```
