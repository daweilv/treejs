import ajax from './ajax';
import './index.less';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function uniq(arr) {
  const map = {};
  return arr.reduce((acc, item) => {
    if (!map[item]) {
      map[item] = true;
      acc.push(item);
    }
    return acc;
  }, []);
}

function empty(ele) {
  while (ele.firstChild) {
    ele.removeChild(ele.firstChild);
  }
}

function animation(duration, callback) {
  requestAnimationFrame(() => {
    callback.enter();
    requestAnimationFrame(() => {
      callback.active();
      setTimeout(() => {
        callback.leave();
      }, duration);
    });
  });
}

export default function Tree(container, options) {
  const defaultOptions = {
    selectMode: 'checkbox',
    values: [],
    disables: [],
    beforeLoad: null,
    loaded: null,
    url: null,
    method: 'GET',
    closeDepth: null,
  };
  this.treeNodes = [];
  this.nodesById = {};
  this.leafNodesById = {};
  this.liElementsById = {};
  this.willUpdateNodesById = {};
  this.container = container;
  this.options = Object.assign(defaultOptions, options);

  Object.defineProperties(this, {
    values: {
      get() {
        return this.getValues();
      },
      set(values) {
        return this.setValues(uniq(values));
      },
    },
    disables: {
      get() {
        return this.getDisables();
      },
      set(values) {
        return this.setDisables(uniq(values));
      },
    },
    selectedNodes: {
      get() {
        let nodes = [];
        let nodesById = this.nodesById;
        for (let id in nodesById) {
          if (
            nodesById.hasOwnProperty(id) &&
            (nodesById[id].status === 1 || nodesById[id].status === 2)
          ) {
            const node = Object.assign({}, nodesById[id]);
            delete node.parent;
            delete node.children;
            nodes.push(node);
          }
        }
        return nodes;
      },
    },
    disabledNodes: {
      get() {
        let nodes = [];
        let nodesById = this.nodesById;
        for (let id in nodesById) {
          if (nodesById.hasOwnProperty(id) && nodesById[id].disabled) {
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
  const {values, disables, loaded} = this.options;
  if (values && values.length) defaultValues = values;
  defaultValues.length && this.setValues(defaultValues);
  if (disables && disables.length) defaultDisables = disables;
  defaultDisables.length && this.setDisables(defaultDisables);
  loaded && loaded.call(this);
  console.timeEnd('init');
};

Tree.prototype.load = function(callback) {
  console.time('load');
  const {url, method, beforeLoad} = this.options;
  ajax({
    url,
    method,
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
  const treeEle = Tree.createRootEle();
  treeEle.appendChild(this.buildTree(treeNodes, 0));
  this.bindEvent(treeEle);
  const ele = document.querySelector(this.container);
  empty(ele);
  ele.appendChild(treeEle);
};

Tree.prototype.buildTree = function(nodes, depth) {
  const rootUlEle = Tree.createUlEle();
  if (nodes && nodes.length) {
    nodes.forEach(node => {
      const liEle = Tree.createLiEle(
        node,
        depth === this.options.closeDepth - 1
      );
      this.liElementsById[node.id] = liEle;
      let ulEle = null;
      if (node.children && node.children.length) {
        ulEle = this.buildTree(node.children, depth + 1);
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
      const {target} = e;
      if (
        target.nodeName === 'SPAN' &&
        (target.classList.contains('treejs-checkbox') ||
          target.classList.contains('treejs-label'))
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
  const node = this.nodesById[id];
  const {onChange} = this.options;
  if (!node.disabled) {
    this.setValue(id);
    this.updateLiElements();
  }
  onChange && onChange.call(this);
  console.timeEnd('onItemClick');
};

Tree.prototype.setValue = function(value) {
  const node = this.nodesById[value];
  if (!node) return;
  const prevStatus = node.status;
  const status = prevStatus === 1 || prevStatus === 2 ? 0 : 2;
  node.status = status;
  this.markWillUpdateNode(node);
  this.walkUp(node, 'status');
  this.walkDown(node, 'status');
};

Tree.prototype.getValues = function() {
  const values = [];
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
  const {onChange} = this.options;
  onChange && onChange.call(this);
};

Tree.prototype.setDisable = function(value) {
  const node = this.nodesById[value];
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
  const values = [];
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
  this.willUpdateNodesById = this.getSelectedNodesById();
  Object.values(this.willUpdateNodesById).forEach(node => {
    if (!node.disabled) node.status = 0;
  });
};

Tree.prototype.emptyNodesDisable = function() {
  this.willUpdateNodesById = this.getDisabledNodesById();
  Object.values(this.willUpdateNodesById).forEach(node => {
    node.disabled = false;
  });
};

Tree.prototype.getSelectedNodesById = function() {
  return Object.entries(this.nodesById).reduce((acc, [id, node]) => {
    if (node.status === 1 || node.status === 2) {
      acc[id] = node;
    }
    return acc;
  }, {});
};

Tree.prototype.getDisabledNodesById = function() {
  return Object.entries(this.nodesById).reduce((acc, [id, node]) => {
    if (node.disabled) {
      acc[id] = node;
    }
    return acc;
  }, {});
};

Tree.prototype.updateLiElements = function() {
  Object.values(this.willUpdateNodesById).forEach(node => {
    this.updateLiElement(node);
  });
  this.willUpdateNodesById = {};
};

Tree.prototype.markWillUpdateNode = function(node) {
  this.willUpdateNodesById[node.id] = node;
};

Tree.prototype.onSwitcherClick = function(target) {
  const liEle = target.parentNode;
  const ele = liEle.lastChild;
  const height = ele.scrollHeight;
  if (liEle.classList.contains('treejs-node__close')) {
    animation(150, {
      enter() {
        ele.style.height = 0;
        ele.style.opacity = 0;
      },
      active() {
        ele.style.height = `${height}px`;
        ele.style.opacity = 1;
      },
      leave() {
        ele.style.height = '';
        ele.style.opacity = '';
        liEle.classList.remove('treejs-node__close');
      },
    });
  } else {
    animation(150, {
      enter() {
        ele.style.height = `${height}px`;
        ele.style.opacity = 1;
      },
      active() {
        ele.style.height = 0;
        ele.style.opacity = 0;
      },
      leave() {
        ele.style.height = '';
        ele.style.opacity = '';
        liEle.classList.add('treejs-node__close');
      },
    });
  }
};

Tree.prototype.walkUp = function(node, changeState) {
  const {parent} = node;
  if (parent) {
    if (changeState === 'status') {
      let pStatus = null;
      const statusCount = parent.children.reduce((acc, child) => {
        if (!isNaN(child.status)) return acc + child.status;
        return acc;
      }, 0);
      if (statusCount) {
        pStatus = statusCount === parent.children.length * 2 ? 2 : 1;
      } else {
        pStatus = 0;
      }
      if (parent.status === pStatus) return;
      parent.status = pStatus;
    } else {
      const pDisabled = parent.children.reduce(
        (acc, child) => acc && child.disabled,
        true
      );
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
  const {classList} = this.liElementsById[node.id];
  switch (node.status) {
    case 0:
      classList.remove('treejs-node__halfchecked', 'treejs-node__checked');
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
      if (!classList.contains('treejs-node__disabled'))
        classList.add('treejs-node__disabled');
      break;
    case false:
      if (classList.contains('treejs-node__disabled'))
        classList.remove('treejs-node__disabled');
      break;
  }
};

Tree.parseTreeData = function(data) {
  const treeNodes = deepClone(data);
  const nodesById = {};
  const leafNodesById = {};
  const values = [];
  const disables = [];
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
  const div = document.createElement('div');
  div.classList.add('treejs');
  return div;
};

Tree.createUlEle = function() {
  const ul = document.createElement('ul');
  ul.classList.add('treejs-nodes');
  return ul;
};

Tree.createLiEle = function(node, closed) {
  const li = document.createElement('li');
  li.classList.add('treejs-node');
  if (closed) li.classList.add('treejs-node__close');
  if (node.children && node.children.length) {
    const switcher = document.createElement('span');
    switcher.classList.add('treejs-switcher');
    li.appendChild(switcher);
  } else {
    li.classList.add('treejs-placeholder');
  }
  const checkbox = document.createElement('span');
  checkbox.classList.add('treejs-checkbox');
  li.appendChild(checkbox);
  const label = document.createElement('span');
  label.classList.add('treejs-label');
  const text = document.createTextNode(node.text);
  label.appendChild(text);
  li.appendChild(label);
  li.nodeId = node.id;
  return li;
};
