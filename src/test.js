/* eslint-disable */
new Tree('#container', {
    data: [], // tree data
});

new Tree('#container', {
    data: [], // tree data
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
    loaded: () => {
        // to something or setValues() after Tree loaded callback
        let treeJson = [];
        this.values = treeJson;
    },
});

new Tree('#container', {
    url: '/api/treeWithCheckedStatusJson',
});

let tree = new Tree();
let values = tree.values;
let selectedNodes = tree.selectedNodes;
