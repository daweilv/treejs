import ajax from './ajax';
import './index.less';

export default function Tree(container, options) {
    const defaultOptions = {
        selectMode: 'checkbox',
        values: [],
        beforeLoad: null,
        loaded: null,
        url: null,
        method: 'GET',
    };

    this.treeNodes = [];
    this.nodesById = {};
    this.leafNodesById = {};
    this.liElementsById = {};
    // this._selectedNodesById = {};
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
    });

    if (this.options.url) {
        this.init();
    } else {
        this.load(this.options.data);
    }
}

Tree.prototype.init = function() {
    let { url, method, beforeLoad } = this.options;
    ajax({
        url: url,
        method: method,
        success: result => {
            let data = result;
            if (beforeLoad) {
                data = beforeLoad(result);
            }
            this.load(data);
        },
    });
};

Tree.prototype.load = function(data) {
    console.time('load');
    let { treeNodes, nodesById, leafNodesById } = Tree.parseTreeData(data);
    this.treeNodes = treeNodes;
    this.nodesById = nodesById;
    this.leafNodesById = leafNodesById;
    let treeEle = this.render(this.treeNodes);
    this.bindEvent(treeEle);
    let ele = document.querySelector(this.container);
    ele.appendChild(treeEle, ele);
    const { values, loaded } = this.options;
    values && values.length && this.setValues(values);
    loaded && loaded.call(this);
    console.timeEnd('load');
};

Tree.prototype.render = function(treeNodes) {
    let treeEle = Tree.createRootEle();
    treeEle.appendChild(this.buildTree(treeNodes));
    return treeEle;
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
            if (target.nodeName === 'LABEL') {
                this.onItemClick(target);
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

Tree.prototype.onItemClick = function(target) {
    console.time('onItemClick');
    const id = target.nodeId;
    this.setValue(id);
    this.updateLiElements();
    console.timeEnd('onItemClick');
};

Tree.prototype.setValue = function(value) {
    let node = this.nodesById[value];
    if (!node) return;
    const prevStatus = node.status;
    const status = prevStatus === 1 || prevStatus === 2 ? 0 : 2;
    node.status = status;
    this.markWillUpdateNode(node);
    this.walkUp(node);
    this.walkDown(node);
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

Tree.prototype.emptyNodesCheckStatus = function() {
    let willUpdateNodesById = (this._willUpdateNodesById = this.getSelectedNodesById());
    for (let id in willUpdateNodesById) {
        if (willUpdateNodesById.hasOwnProperty(id)) {
            willUpdateNodesById[id].status = 0;
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

Tree.prototype.updateLiElements = function() {
    let willUpdateNodesById = this._willUpdateNodesById;
    for (let id in willUpdateNodesById) {
        if (willUpdateNodesById.hasOwnProperty(id)) {
            this.updateLiElement(id, willUpdateNodesById[id].status);
        }
    }
    this._willUpdateNodesById = {};
};

Tree.prototype.markWillUpdateNode = function(node) {
    this._willUpdateNodesById[node.id] = node;
};

Tree.prototype.onSwitcherClick = function(target) {
    let liEle = target.parentNode.parentNode;
    let subUlEle = target.parentNode.nextSibling;
    if (liEle.classList.contains('treejs-node__close')) {
        liEle.classList.remove('treejs-node__close');
        // subUlEle.style.transform = 'scaleY(1)';
        subUlEle.style.height = 'auto';
    } else {
        // subUlEle.style.transform = 'scaleY(0)';
        // subUlEle.style.height = '0px';
        let height = getComputedStyle(subUlEle).height;
        subUlEle.style.height = height;
        setTimeout(() => {
            subUlEle.style.height = '0px';
        });
        liEle.classList.add('treejs-node__close');
    }
};

Tree.prototype.walkUp = function(node) {
    let parent = node.parent;
    if (parent) {
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
        if (parent.status !== pStatus) {
            parent.status = pStatus;
            this.markWillUpdateNode(parent);
            this.walkUp(parent);
        }
    }
};

Tree.prototype.walkDown = function(node) {
    if (node.children && node.children.length) {
        node.children.forEach(child => {
            child.status = node.status;
            this.markWillUpdateNode(child);
            this.walkDown(child);
        });
    }
};

Tree.prototype.updateLiElement = function(id, status) {
    let classList = this.liElementsById[id].classList;
    switch (status) {
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
        default:
            break;
    }
};

Tree.parseTreeData = function(data) {
    let treeNodes = deepClone(data);
    let nodesById = {};
    let leafNodesById = {};
    const walkTree = function(nodes, parent) {
        nodes.forEach(node => {
            nodesById[node.id] = node;
            if (parent) node.parent = parent;
            if (node.children && node.children.length) {
                walkTree(node.children, node);
            } else {
                leafNodesById[node.id] = node;
            }
        });
    };
    walkTree(treeNodes);
    return { treeNodes, nodesById, leafNodesById };
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
    let label = document.createElement('label');
    if (node.children && node.children.length) {
        let span = document.createElement('span');
        span.classList.add('treejs-switcher');
        label.appendChild(span);
    }
    let text = document.createTextNode(node.text);
    label.appendChild(text);
    label.nodeId = node.id;
    li.appendChild(label);
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
