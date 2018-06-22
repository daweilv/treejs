import ajax from './ajax';
import './index.less';

export default function Tree(container, options) {
    const defaultOptions = {
        selectMode: 'checkbox',
        values: [],
        disables: [],
        beforeLoad: null,
        loaded: null,
        url: null,
        method: 'GET',
    };
    this.treeNodes = [];
    this.nodesById = {};
    this.leafNodesById = {};
    this.liElementsById = {};
    this._willUpdateNodesById = {};
    this.container = container;
    this.options = Object.assign(defaultOptions, options);

    Object.defineProperties(this, {
        values: {
            get: function() {
                return this.getValues();
            },
            set: function(values) {
                return this.setValues(arrayDistinct(values));
            },
        },
        disables: {
            get: function() {
                return this.getDisables();
            },
            set: function(values) {
                return this.setDisables(arrayDistinct(values));
            },
        },
        selectedNodes: {
            get: function() {
                let nodes = [];
                let nodesById = this.nodesById;
                for (let id in nodesById) {
                    if (
                        nodesById.hasOwnProperty(id) &&
                        (nodesById[id].status === 1 ||
                            nodesById[id].status === 2)
                    ) {
                        let node = Object.assign({}, nodesById[id]);
                        delete node.parent;
                        nodes.push(node);
                    }
                }
                return nodes;
            },
        },
        disabledNodes: {
            get: function() {
                let nodes = [];
                let nodesById = this.nodesById;
                for (let id in nodesById) {
                    if (
                        nodesById.hasOwnProperty(id) &&
                        nodesById[id].disabled
                    ) {
                        let node = Object.assign({}, nodesById[id]);
                        delete node.parent;
                        nodes.push(node);
                    }
                }
                return nodes;
            },
        },
    });

    if (this.options.url) {
        this.load(data => {
            this.init(data);
        });
    } else {
        this.init(this.options.data);
    }
}

Tree.prototype.init = function(data) {
    console.time('init');
    let {
        treeNodes,
        nodesById,
        leafNodesById,
        defaultValues,
        defaultDisables,
    } = Tree.parseTreeData(data);
    this.treeNodes = treeNodes;
    this.nodesById = nodesById;
    this.leafNodesById = leafNodesById;
    this.render(this.treeNodes);
    const { values, disables, loaded } = this.options;
    if (values && values.length) defaultValues = values;
    defaultValues.length && this.setValues(defaultValues);
    if (disables && disables.length) defaultDisables = disables;
    defaultDisables.length && this.setDisables(defaultDisables);
    loaded && loaded.call(this);
    console.timeEnd('init');
};

Tree.prototype.load = function(callback) {
    console.time('load');
    let { url, method, beforeLoad } = this.options;
    ajax({
        url: url,
        method: method,
        success: result => {
            let data = result;
            console.timeEnd('load');
            if (beforeLoad) {
                data = beforeLoad(result);
            }
            callback(data);
        },
    });
};

Tree.prototype.render = function(treeNodes) {
    let treeEle = Tree.createRootEle();
    treeEle.appendChild(this.buildTree(treeNodes));
    this.bindEvent(treeEle);
    let ele = document.querySelector(this.container);
    empty(ele);
    ele.appendChild(treeEle);
};

Tree.prototype.buildTree = function(nodes) {
    let rootUlEle = Tree.createUlEle();
    if (nodes && nodes.length) {
        nodes.forEach(node => {
            let liEle = Tree.createLiEle(node);
            this.liElementsById[node.id] = liEle;
            let ulEle = null;
            if (node.children && node.children.length) {
                ulEle = this.buildTree(node.children);
            }
            ulEle && liEle.appendChild(ulEle);
            rootUlEle.appendChild(liEle);
        });
    }
    return rootUlEle;
};

Tree.prototype.bindEvent = function(ele) {
    ele.addEventListener(
        'click',
        e => {
            let target = e.target;
            if (
                target.nodeName === 'SPAN' &&
                target.classList.contains('treejs-checkbox')
            ) {
                this.onItemClick(target.parentNode.nodeId);
            } else if (
                target.nodeName === 'LI' &&
                target.classList.contains('treejs-node')
            ) {
                this.onItemClick(target.nodeId);
            } else if (
                target.nodeName === 'SPAN' &&
                target.classList.contains('treejs-switcher')
            ) {
                this.onSwitcherClick(target);
            }
        },
        false
    );
};

Tree.prototype.onItemClick = function(id) {
    console.time('onItemClick');
    let node = this.nodesById[id];
    if (!node.disabled) {
        this.setValue(id);
        this.updateLiElements();
    }
    console.timeEnd('onItemClick');
};

Tree.prototype.setValue = function(value) {
    let node = this.nodesById[value];
    if (!node) return;
    const prevStatus = node.status;
    const status = prevStatus === 1 || prevStatus === 2 ? 0 : 2;
    node.status = status;
    this.markWillUpdateNode(node);
    this.walkUp(node, 'status');
    this.walkDown(node, 'status');
};

Tree.prototype.getValues = function() {
    let values = [];
    for (let id in this.leafNodesById) {
        if (this.leafNodesById.hasOwnProperty(id)) {
            if (
                this.leafNodesById[id].status === 1 ||
                this.leafNodesById[id].status === 2
            ) {
                values.push(id);
            }
        }
    }
    return values;
};

Tree.prototype.setValues = function(values) {
    this.emptyNodesCheckStatus();
    values.forEach(value => {
        this.setValue(value);
    });
    this.updateLiElements();
};

Tree.prototype.setDisable = function(value) {
    let node = this.nodesById[value];
    if (!node) return;
    const prevDisabled = node.disabled;
    if (!prevDisabled) {
        node.disabled = true;
        this.markWillUpdateNode(node);
        this.walkUp(node, 'disabled');
        this.walkDown(node, 'disabled');
    }
};

Tree.prototype.getDisables = function() {
    let values = [];
    for (let id in this.leafNodesById) {
        if (this.leafNodesById.hasOwnProperty(id)) {
            if (this.leafNodesById[id].disabled) {
                values.push(id);
            }
        }
    }
    return values;
};

Tree.prototype.setDisables = function(values) {
    this.emptyNodesDisable();
    values.forEach(value => {
        this.setDisable(value);
    });
    this.updateLiElements();
};

Tree.prototype.emptyNodesCheckStatus = function() {
    let willUpdateNodesById = (this._willUpdateNodesById = this.getSelectedNodesById());
    for (let id in willUpdateNodesById) {
        if (
            willUpdateNodesById.hasOwnProperty(id) &&
            !willUpdateNodesById.disabled
        ) {
            willUpdateNodesById[id].status = 0;
        }
    }
};

Tree.prototype.emptyNodesDisable = function() {
    let willUpdateNodesById = (this._willUpdateNodesById = this.getDisabledNodesById());
    for (let id in willUpdateNodesById) {
        if (willUpdateNodesById.hasOwnProperty(id)) {
            willUpdateNodesById[id].disabled = false;
        }
    }
};

Tree.prototype.getSelectedNodesById = function() {
    let obj = {};
    let nodesById = this.nodesById;
    for (let id in nodesById) {
        if (
            nodesById.hasOwnProperty(id) &&
            (nodesById[id].status === 1 || nodesById[id].status === 2)
        ) {
            obj[id] = nodesById[id];
        }
    }
    return obj;
};

Tree.prototype.getDisabledNodesById = function() {
    let obj = {};
    let nodesById = this.nodesById;
    for (let id in nodesById) {
        if (nodesById.hasOwnProperty(id) && nodesById[id].disabled) {
            obj[id] = nodesById[id];
        }
    }
    return obj;
};

Tree.prototype.updateLiElements = function() {
    let willUpdateNodesById = this._willUpdateNodesById;
    for (let id in willUpdateNodesById) {
        if (willUpdateNodesById.hasOwnProperty(id)) {
            this.updateLiElement(willUpdateNodesById[id]);
        }
    }
    this._willUpdateNodesById = {};
};

Tree.prototype.markWillUpdateNode = function(node) {
    this._willUpdateNodesById[node.id] = node;
};

Tree.prototype.onSwitcherClick = function(target) {
    let liEle = target.parentNode;
    let subUlEle = liEle.lastChild;
    if (liEle.classList.contains('treejs-node__close')) {
        liEle.classList.remove('treejs-node__close');
        subUlEle.style.height = 'auto';
    } else {
        let height = getComputedStyle(subUlEle).height;
        subUlEle.style.height = height;
        setTimeout(() => {
            subUlEle.style.height = '0px';
        });
        liEle.classList.add('treejs-node__close');
    }
};

Tree.prototype.walkUp = function(node, changeState) {
    let parent = node.parent;
    if (parent) {
        if (changeState === 'status') {
            let pStatus = null;
            let statusCount = 0;
            parent.children.forEach(node => {
                if (!isNaN(node.status)) statusCount += node.status;
            });
            if (statusCount) {
                pStatus = statusCount === parent.children.length * 2 ? 2 : 1;
            } else {
                pStatus = 0;
            }
            if (parent.status === pStatus) return;
            parent.status = pStatus;
        } else {
            let pDisabled = true;
            parent.children.forEach(node => {
                pDisabled = pDisabled && node.disabled;
            });
            if (parent.disabled === pDisabled) return;
            parent.disabled = pDisabled;
        }
        this.markWillUpdateNode(parent);
        this.walkUp(parent, changeState);
    }
};

Tree.prototype.walkDown = function(node, changeState) {
    if (node.children && node.children.length) {
        node.children.forEach(child => {
            if (changeState === 'status' && child.disabled) return;
            child[changeState] = node[changeState];
            this.markWillUpdateNode(child);
            this.walkDown(child, changeState);
        });
    }
};

Tree.prototype.updateLiElement = function(node) {
    let classList = this.liElementsById[node.id].classList;
    switch (node.status) {
        case 0:
            classList.remove(
                'treejs-node__halfchecked',
                'treejs-node__checked'
            );
            break;
        case 1:
            classList.remove('treejs-node__checked');
            classList.add('treejs-node__halfchecked');
            break;
        case 2:
            classList.remove('treejs-node__halfchecked');
            classList.add('treejs-node__checked');
            break;
    }

    switch (node.disabled) {
        case true:
            if (!classList.contains('treejs-node__disabled')) classList.add('treejs-node__disabled');
            break;
        case false:
            if (classList.contains('treejs-node__disabled')) classList.remove('treejs-node__disabled');
            break;
    }
};

Tree.parseTreeData = function(data) {
    let treeNodes = deepClone(data);
    let nodesById = {};
    let leafNodesById = {};
    let values = [];
    let disables = [];
    const walkTree = function(nodes, parent) {
        nodes.forEach(node => {
            nodesById[node.id] = node;
            if (node.checked) values.push(node.id);
            if (node.disabled) disables.push(node.id);
            if (parent) node.parent = parent;
            if (node.children && node.children.length) {
                walkTree(node.children, node);
            } else {
                leafNodesById[node.id] = node;
            }
        });
    };
    walkTree(treeNodes);
    return {
        treeNodes,
        nodesById,
        leafNodesById,
        defaultValues: values,
        defaultDisables: disables,
    };
};

Tree.createRootEle = function() {
    let div = document.createElement('div');
    div.classList.add('treejs');
    return div;
};

Tree.createUlEle = function() {
    let ul = document.createElement('ul');
    ul.classList.add('treejs-nodes');
    return ul;
};

Tree.createLiEle = function(node) {
    let li = document.createElement('li');
    li.classList.add('treejs-node');
    if (node.children && node.children.length) {
        let switcher = document.createElement('span');
        switcher.classList.add('treejs-switcher');
        li.appendChild(switcher);
    } else {
        li.classList.add('treejs-placeholder');
    }
    let checkbox = document.createElement('span');
    checkbox.classList.add('treejs-checkbox');
    li.appendChild(checkbox);
    let text = document.createTextNode(node.text);
    li.appendChild(text);
    li.nodeId = node.id;
    return li;
};

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function arrayDistinct(arr) {
    let obj = {};
    let newArr = [];
    arr.forEach(item => {
        if (!obj[item]) {
            obj[item] = true;
            newArr.push(item);
        }
    });
    return newArr;
}
function empty(ele) {
    while (ele.firstChild) {
        ele.removeChild(ele.firstChild);
    }
}
