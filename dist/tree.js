/*!
 * treejs
 * @version 1.1.0
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
  var defaultOptions = {
    selectMode: 'checkbox',
    values: [],
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
    }
  });

  if (this.options.url) {
    this.init();
  } else {
    this.load(this.options.data);
  }
}

Tree.prototype.init = function () {
  var _this = this;

  var _this$options = this.options,
      url = _this$options.url,
      method = _this$options.method,
      beforeLoad = _this$options.beforeLoad;
  (0, _ajax.default)({
    url: url,
    method: method,
    success: function success(result) {
      var data = result;

      if (beforeLoad) {
        data = beforeLoad(result);
      }

      _this.load(data);
    }
  });
};

Tree.prototype.load = function (data) {
  console.time('load');

  var _Tree$parseTreeData = Tree.parseTreeData(data),
      treeNodes = _Tree$parseTreeData.treeNodes,
      nodesById = _Tree$parseTreeData.nodesById,
      leafNodesById = _Tree$parseTreeData.leafNodesById,
      defaultValues = _Tree$parseTreeData.defaultValues;

  this.treeNodes = treeNodes;
  this.nodesById = nodesById;
  this.leafNodesById = leafNodesById;
  var treeEle = this.render(this.treeNodes);
  this.bindEvent(treeEle);
  var ele = document.querySelector(this.container);
  empty(ele);
  ele.appendChild(treeEle);
  var _this$options2 = this.options,
      values = _this$options2.values,
      loaded = _this$options2.loaded;
  if (values && values.length) defaultValues = values;
  defaultValues.length && this.setValues(defaultValues);
  loaded && loaded.call(this);
  console.timeEnd('load');
};

Tree.prototype.render = function (treeNodes) {
  var treeEle = Tree.createRootEle();
  treeEle.appendChild(this.buildTree(treeNodes));
  return treeEle;
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
  this.setValue(id);
  this.updateLiElements();
  console.timeEnd('onItemClick');
};

Tree.prototype.setValue = function (value) {
  var node = this.nodesById[value];
  if (!node) return;
  var prevStatus = node.status;
  var status = prevStatus === 1 || prevStatus === 2 ? 0 : 2;
  node.status = status;
  this.markWillUpdateNode(node);
  this.walkUp(node);
  this.walkDown(node);
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

Tree.prototype.emptyNodesCheckStatus = function () {
  var willUpdateNodesById = this._willUpdateNodesById = this.getSelectedNodesById();

  for (var id in willUpdateNodesById) {
    if (willUpdateNodesById.hasOwnProperty(id)) {
      willUpdateNodesById[id].status = 0;
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

Tree.prototype.updateLiElements = function () {
  var willUpdateNodesById = this._willUpdateNodesById;

  for (var id in willUpdateNodesById) {
    if (willUpdateNodesById.hasOwnProperty(id)) {
      this.updateLiElement(id, willUpdateNodesById[id].status);
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

Tree.prototype.walkUp = function (node) {
  var parent = node.parent;

  if (parent) {
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

    if (parent.status !== pStatus) {
      parent.status = pStatus;
      this.markWillUpdateNode(parent);
      this.walkUp(parent);
    }
  }
};

Tree.prototype.walkDown = function (node) {
  var _this5 = this;

  if (node.children && node.children.length) {
    node.children.forEach(function (child) {
      child.status = node.status;

      _this5.markWillUpdateNode(child);

      _this5.walkDown(child);
    });
  }
};

Tree.prototype.updateLiElement = function (id, status) {
  var classList = this.liElementsById[id].classList;

  switch (status) {
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

    default:
      break;
  }
};

Tree.parseTreeData = function (data) {
  var treeNodes = deepClone(data);
  var nodesById = {};
  var leafNodesById = {};
  var values = [];

  var walkTree = function walkTree(nodes, parent) {
    nodes.forEach(function (node) {
      nodesById[node.id] = node;
      if (node.checked) values.push(node.id);
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
    defaultValues: values
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