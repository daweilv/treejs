/*!
 * treejs
 * @version 1.4.1
 * @see https://github.com/daweilv/treejs
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Tree"] = factory();
	else
		root["Tree"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Tree;

var _ajax = _interopRequireDefault(__webpack_require__(1));

__webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Tree(container, options) {
  var _this = this;

  var defaultOptions = {
    selectMode: 'checkbox',
    values: [],
    disables: [],
    beforeLoad: null,
    loaded: null,
    url: null,
    method: 'GET'
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
      get: function get() {
        return this.getValues();
      },
      set: function set(values) {
        return this.setValues(arrayDistinct(values));
      }
    },
    disables: {
      get: function get() {
        return this.getDisables();
      },
      set: function set(values) {
        return this.setDisables(arrayDistinct(values));
      }
    },
    selectedNodes: {
      get: function get() {
        var nodes = [];
        var nodesById = this.nodesById;

        for (var id in nodesById) {
          if (nodesById.hasOwnProperty(id) && (nodesById[id].status === 1 || nodesById[id].status === 2)) {
            var node = Object.assign({}, nodesById[id]);
            delete node.parent;
            nodes.push(node);
          }
        }

        return nodes;
      }
    },
    disabledNodes: {
      get: function get() {
        var nodes = [];
        var nodesById = this.nodesById;

        for (var id in nodesById) {
          if (nodesById.hasOwnProperty(id) && nodesById[id].disabled) {
            var node = Object.assign({}, nodesById[id]);
            delete node.parent;
            nodes.push(node);
          }
        }

        return nodes;
      }
    }
  });

  if (this.options.url) {
    this.load(function (data) {
      _this.init(data);
    });
  } else {
    this.init(this.options.data);
  }
}

Tree.prototype.init = function (data) {
  console.time('init');

  var _Tree$parseTreeData = Tree.parseTreeData(data),
      treeNodes = _Tree$parseTreeData.treeNodes,
      nodesById = _Tree$parseTreeData.nodesById,
      leafNodesById = _Tree$parseTreeData.leafNodesById,
      defaultValues = _Tree$parseTreeData.defaultValues,
      defaultDisables = _Tree$parseTreeData.defaultDisables;

  this.treeNodes = treeNodes;
  this.nodesById = nodesById;
  this.leafNodesById = leafNodesById;
  this.render(this.treeNodes);
  var _this$options = this.options,
      values = _this$options.values,
      disables = _this$options.disables,
      loaded = _this$options.loaded;
  if (values && values.length) defaultValues = values;
  defaultValues.length && this.setValues(defaultValues);
  if (disables && disables.length) defaultDisables = disables;
  defaultDisables.length && this.setDisables(defaultDisables);
  loaded && loaded.call(this);
  console.timeEnd('init');
};

Tree.prototype.load = function (callback) {
  console.time('load');
  var _this$options2 = this.options,
      url = _this$options2.url,
      method = _this$options2.method,
      beforeLoad = _this$options2.beforeLoad;
  (0, _ajax.default)({
    url: url,
    method: method,
    success: function success(result) {
      var data = result;
      console.timeEnd('load');

      if (beforeLoad) {
        data = beforeLoad(result);
      }

      callback(data);
    }
  });
};

Tree.prototype.render = function (treeNodes) {
  var treeEle = Tree.createRootEle();
  treeEle.appendChild(this.buildTree(treeNodes));
  this.bindEvent(treeEle);
  var ele = document.querySelector(this.container);
  empty(ele);
  ele.appendChild(treeEle);
};

Tree.prototype.buildTree = function (nodes) {
  var _this2 = this;

  var rootUlEle = Tree.createUlEle();

  if (nodes && nodes.length) {
    nodes.forEach(function (node) {
      var liEle = Tree.createLiEle(node);
      _this2.liElementsById[node.id] = liEle;
      var ulEle = null;

      if (node.children && node.children.length) {
        ulEle = _this2.buildTree(node.children);
      }

      ulEle && liEle.appendChild(ulEle);
      rootUlEle.appendChild(liEle);
    });
  }

  return rootUlEle;
};

Tree.prototype.bindEvent = function (ele) {
  var _this3 = this;

  ele.addEventListener('click', function (e) {
    var target = e.target;

    if (target.nodeName === 'SPAN' && target.classList.contains('treejs-checkbox')) {
      _this3.onItemClick(target.parentNode.nodeId);
    } else if (target.nodeName === 'LI' && target.classList.contains('treejs-node')) {
      _this3.onItemClick(target.nodeId);
    } else if (target.nodeName === 'SPAN' && target.classList.contains('treejs-switcher')) {
      _this3.onSwitcherClick(target);
    }
  }, false);
};

Tree.prototype.onItemClick = function (id) {
  console.time('onItemClick');
  var node = this.nodesById[id];

  if (!node.disabled) {
    this.setValue(id);
    this.updateLiElements();
  }

  console.timeEnd('onItemClick');
};

Tree.prototype.setValue = function (value) {
  var node = this.nodesById[value];
  if (!node) return;
  var prevStatus = node.status;
  var status = prevStatus === 1 || prevStatus === 2 ? 0 : 2;
  node.status = status;
  this.markWillUpdateNode(node);
  this.walkUp(node, 'status');
  this.walkDown(node, 'status');
};

Tree.prototype.getValues = function () {
  var values = [];

  for (var id in this.leafNodesById) {
    if (this.leafNodesById.hasOwnProperty(id)) {
      if (this.leafNodesById[id].status === 1 || this.leafNodesById[id].status === 2) {
        values.push(id);
      }
    }
  }

  return values;
};

Tree.prototype.setValues = function (values) {
  var _this4 = this;

  this.emptyNodesCheckStatus();
  values.forEach(function (value) {
    _this4.setValue(value);
  });
  this.updateLiElements();
};

Tree.prototype.setDisable = function (value) {
  var node = this.nodesById[value];
  if (!node) return;
  var prevDisabled = node.disabled;

  if (!prevDisabled) {
    node.disabled = true;
    this.markWillUpdateNode(node);
    this.walkUp(node, 'disabled');
    this.walkDown(node, 'disabled');
  }
};

Tree.prototype.getDisables = function () {
  var values = [];

  for (var id in this.leafNodesById) {
    if (this.leafNodesById.hasOwnProperty(id)) {
      if (this.leafNodesById[id].disabled) {
        values.push(id);
      }
    }
  }

  return values;
};

Tree.prototype.setDisables = function (values) {
  var _this5 = this;

  this.emptyNodesDisable();
  values.forEach(function (value) {
    _this5.setDisable(value);
  });
  this.updateLiElements();
};

Tree.prototype.emptyNodesCheckStatus = function () {
  var willUpdateNodesById = this._willUpdateNodesById = this.getSelectedNodesById();

  for (var id in willUpdateNodesById) {
    if (willUpdateNodesById.hasOwnProperty(id) && !willUpdateNodesById.disabled) {
      willUpdateNodesById[id].status = 0;
    }
  }
};

Tree.prototype.emptyNodesDisable = function () {
  var willUpdateNodesById = this._willUpdateNodesById = this.getDisabledNodesById();

  for (var id in willUpdateNodesById) {
    if (willUpdateNodesById.hasOwnProperty(id)) {
      willUpdateNodesById[id].disabled = false;
    }
  }
};

Tree.prototype.getSelectedNodesById = function () {
  var obj = {};
  var nodesById = this.nodesById;

  for (var id in nodesById) {
    if (nodesById.hasOwnProperty(id) && (nodesById[id].status === 1 || nodesById[id].status === 2)) {
      obj[id] = nodesById[id];
    }
  }

  return obj;
};

Tree.prototype.getDisabledNodesById = function () {
  var obj = {};
  var nodesById = this.nodesById;

  for (var id in nodesById) {
    if (nodesById.hasOwnProperty(id) && nodesById[id].disabled) {
      obj[id] = nodesById[id];
    }
  }

  return obj;
};

Tree.prototype.updateLiElements = function () {
  var willUpdateNodesById = this._willUpdateNodesById;

  for (var id in willUpdateNodesById) {
    if (willUpdateNodesById.hasOwnProperty(id)) {
      this.updateLiElement(willUpdateNodesById[id]);
    }
  }

  this._willUpdateNodesById = {};
};

Tree.prototype.markWillUpdateNode = function (node) {
  this._willUpdateNodesById[node.id] = node;
};

Tree.prototype.onSwitcherClick = function (target) {
  var liEle = target.parentNode;
  var subUlEle = liEle.lastChild;

  if (liEle.classList.contains('treejs-node__close')) {
    liEle.classList.remove('treejs-node__close');
    subUlEle.style.height = 'auto';
  } else {
    var height = getComputedStyle(subUlEle).height;
    subUlEle.style.height = height;
    setTimeout(function () {
      subUlEle.style.height = '0px';
    });
    liEle.classList.add('treejs-node__close');
  }
};

Tree.prototype.walkUp = function (node, changeState) {
  var parent = node.parent;

  if (parent) {
    if (changeState === 'status') {
      var pStatus = null;
      var statusCount = 0;
      parent.children.forEach(function (node) {
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
      var pDisabled = true;
      parent.children.forEach(function (node) {
        pDisabled = pDisabled && node.disabled;
      });
      if (parent.disabled === pDisabled) return;
      parent.disabled = pDisabled;
    }

    this.markWillUpdateNode(parent);
    this.walkUp(parent, changeState);
  }
};

Tree.prototype.walkDown = function (node, changeState) {
  var _this6 = this;

  if (node.children && node.children.length) {
    node.children.forEach(function (child) {
      if (changeState === 'status' && child.disabled) return;
      child[changeState] = node[changeState];

      _this6.markWillUpdateNode(child);

      _this6.walkDown(child, changeState);
    });
  }
};

Tree.prototype.updateLiElement = function (node) {
  var classList = this.liElementsById[node.id].classList;

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
      if (!classList.contains('treejs-node__disabled')) classList.add('treejs-node__disabled');
      break;

    case false:
      if (classList.contains('treejs-node__disabled')) classList.remove('treejs-node__disabled');
      break;
  }
};

Tree.parseTreeData = function (data) {
  var treeNodes = deepClone(data);
  var nodesById = {};
  var leafNodesById = {};
  var values = [];
  var disables = [];

  var walkTree = function walkTree(nodes, parent) {
    nodes.forEach(function (node) {
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
    treeNodes: treeNodes,
    nodesById: nodesById,
    leafNodesById: leafNodesById,
    defaultValues: values,
    defaultDisables: disables
  };
};

Tree.createRootEle = function () {
  var div = document.createElement('div');
  div.classList.add('treejs');
  return div;
};

Tree.createUlEle = function () {
  var ul = document.createElement('ul');
  ul.classList.add('treejs-nodes');
  return ul;
};

Tree.createLiEle = function (node) {
  var li = document.createElement('li');
  li.classList.add('treejs-node');

  if (node.children && node.children.length) {
    var switcher = document.createElement('span');
    switcher.classList.add('treejs-switcher');
    li.appendChild(switcher);
  } else {
    li.classList.add('treejs-placeholder');
  }

  var checkbox = document.createElement('span');
  checkbox.classList.add('treejs-checkbox');
  li.appendChild(checkbox);
  var text = document.createTextNode(node.text);
  li.appendChild(text);
  li.nodeId = node.id;
  return li;
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function arrayDistinct(arr) {
  var obj = {};
  var newArr = [];
  arr.forEach(function (item) {
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(_options) {
  var defaultOptions = {
    method: 'GET',
    url: '',
    async: true,
    success: null,
    failed: null,
    'Content-Type': 'application/json; charset=utf-8'
  };
  var options = Object.assign(defaultOptions, _options);
  var xhq = new XMLHttpRequest();
  var params = [];

  for (var key in options.data) {
    if (options.data.hasOwnProperty(key)) {
      params.push(key + '=' + options.data[key]);
    }
  }

  var postData = params.join('&');

  if (options.method.toUpperCase() === 'POST') {
    xhq.open(options.method, options.url, options.async);
    xhq.setRequestHeader('Content-Type', options['Content-Type']);
    xhq.send(postData);
  } else if (options.method.toUpperCase() === 'GET') {
    var url = options.url;

    if (postData) {
      if (url.indexOf('?') !== -1) {
        url += '&' + postData;
      } else {
        url += '?' + postData;
      }
    }

    xhq.open(options.method, url, options.async);
    xhq.setRequestHeader('Content-Type', options['Content-Type']);
    xhq.send(null);
  }

  xhq.onreadystatechange = function () {
    if (xhq.readyState === 4 && xhq.status === 200) {
      var res = xhq.responseText;

      if (options['Content-Type'] === defaultOptions['Content-Type']) {
        res = JSON.parse(res);
      }

      options.success && options.success(res);
    } else {
      options.failed && options.failed(xhq.status);
    }
  };
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=tree.js.map