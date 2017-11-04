define("ClipboardWithTooltip", ["react","react-dom","lodash","focus-tooltip-WithTooltip"], function(__WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_97__, __WEBPACK_EXTERNAL_MODULE_107__, __WEBPACK_EXTERNAL_MODULE_252__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 456);
/******/ })
/************************************************************************/
/******/ ({

/***/ 107:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_107__;

/***/ }),

/***/ 133:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(149)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});

/***/ }),

/***/ 134:
/***/ (function(module, exports, __webpack_require__) {

var is = __webpack_require__(146);
var delegate = __webpack_require__(144);

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;


/***/ }),

/***/ 137:
/***/ (function(module, exports) {

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;


/***/ }),

/***/ 140:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, __webpack_require__(133), __webpack_require__(137), __webpack_require__(134)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});

/***/ }),

/***/ 143:
/***/ (function(module, exports) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

var closest = __webpack_require__(143);

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),

/***/ 146:
/***/ (function(module, exports) {

/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};


/***/ }),

/***/ 149:
/***/ (function(module, exports) {

function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;


/***/ }),

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-env browser */


var _plurr = __webpack_require__(44);

var _plurr2 = _interopRequireDefault(_plurr);

var _webI18nResources = __webpack_require__(41);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var evernoteToPlurrLocale = function evernoteToPlurrLocale(evernoteLocale) {
  if (!evernoteLocale || evernoteLocale === 'en_XA') {
    return 'en';
  } else if (evernoteLocale.startsWith('zh_')) {
    return 'zh';
  } else if (evernoteLocale === 'in') {
    return 'id';
  } else if (evernoteLocale === 'pt_BR') {
    return 'pt-br';
  } else {
    return evernoteLocale;
  }
};

var I18n = function () {
  function I18n(messages, locale) {
    _classCallCheck(this, I18n);

    this.messages = messages;
    this.plurr = new _plurr2.default({ locale: evernoteToPlurrLocale(locale) });
  }

  _createClass(I18n, [{
    key: 'localize',
    value: function localize(key, plurrParams) {
      var msg = this.messages[key];
      if (!msg) {
        // Not translated yet.
        console.error('Untranslated string', key);
        return '';
      }

      /* Our makeJsI18n.pl script replaces all instances of "{N}" with "{{ N }}" during
       * compilation. Undo this work here at runtime for plurr only. */
      msg = this.messages[key].replace(/\{\{ /g, '{').replace(/ \}\}/g, '}');

      try {
        return this.plurr.format(msg, plurrParams || {});
      } catch (e) {
        console.error('Required plurr replacement variable probably not found for', key, '\n', e);
        return '';
      }
    }

    /**
     * A `localize` alias for compatibility with ported web/web modules.
     */

  }, {
    key: 'L',
    value: function L(key, plurrParams) {
      return this.localize(key, plurrParams);
    }
  }]);

  return I18n;
}();

var createWebI18n = function createWebI18n() {
  var _getWebI18nResources = (0, _webI18nResources.getWebI18nResources)(),
      messages = _getWebI18nResources.messages,
      locale = _getWebI18nResources.locale;

  return new I18n(messages, locale);
};

var i18n = createWebI18n();

exports.default = i18n;
module.exports = exports['default'];

/***/ }),

/***/ 252:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_252__;

/***/ }),

/***/ 41:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-env browser */
var DEFAULT_LOCALE = 'en';

var getLocale = function getLocale() {
  var metaLocale = typeof document !== 'undefined' && document.querySelector('meta[name="en:locale"]');
  return metaLocale && metaLocale.content || DEFAULT_LOCALE;
};

var getWebI18nResources = exports.getWebI18nResources = function getWebI18nResources() {
  return {
    locale: getLocale(),
    messages: typeof window === 'undefined' ? {} : window.__EVERNOTE_I18N__
  };
};

/***/ }),

/***/ 44:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (C) 2012-2016 Igor Afanasyev, https://github.com/iafan/Plurr
// Version: 1.0.2

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Plurr = factory();
  }
}(this, function () {
  function addMissingOptions (opt, defaults) {
    for (prop in defaults) {
      if (!opt.hasOwnProperty(prop)) {
        opt[prop] = defaults[prop];
      }
    }
  }


  var _PLURAL = '_PLURAL';


  function Plurr(options) {
    //
    // Initialize object
    //

    var defaultOptions = options || {};
    addMissingOptions(defaultOptions, {
      locale: 'en',
      autoPlurals: true,
      strict: true
    });

    //
    // list of plural equations taken from
    // http://translate.sourceforge.net/wiki/l10n/pluralforms
    //
    var pluralEquations = {
      'ach': function(n) { return 0; }, // Acholi
      'af': function(n) { return (n!=1) ? 1 : 0; }, // Afrikaans
      'ak': function(n) { return (n>1) ? 1 : 0; }, // Akan
      'am': function(n) { return (n>1) ? 1 : 0; }, // Amharic
      'an': function(n) { return (n!=1) ? 1 : 0; }, // Aragonese
      'ar': function(n) { return n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5; }, // Arabic
      'arn': function(n) { return (n>1) ? 1 : 0; }, // Mapudungun
      'ast': function(n) { return (n!=1) ? 1 : 0; }, // Asturian
      'ay': function(n) { return 0; }, // Aymara
      'az': function(n) { return (n!=1) ? 1 : 0; }, // Azerbaijani

      'be': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Belarusian
      'bg': function(n) { return (n!=1) ? 1 : 0; }, // Bulgarian
      'bn': function(n) { return (n!=1) ? 1 : 0; }, // Bengali
      'bo': function(n) { return 0; }, // Tibetan
      'br': function(n) { return (n>1) ? 1 : 0; }, // Breton
      'bs': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Bosnian

      'ca': function(n) { return (n!=1) ? 1 : 0; }, // Catalan
      'cgg': function(n) { return 0; }, // Chiga
      'cs': function(n) { return (n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2; }, // Czech
      'csb': function(n) { return n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2; }, // Kashubian
      'cy': function(n) { return (n==1) ? 0 : (n==2) ? 1 : (n!=8 && n!=11) ? 2 : 3; }, // Welsh

      'da': function(n) { return (n!=1) ? 1 : 0; }, // Danish
      'de': function(n) { return (n!=1) ? 1 : 0; }, // German
      'dz': function(n) { return 0; }, // Dzongkha

      'el': function(n) { return (n!=1) ? 1 : 0; }, // Greek
      'en': function(n) { return (n!=1) ? 1 : 0; }, // English
      'eo': function(n) { return (n!=1) ? 1 : 0; }, // Esperanto
      'es': function(n) { return (n!=1) ? 1 : 0; }, // Spanish
      'es-ar': function(n) { return (n!=1) ? 1 : 0; }, // Argentinean Spanish
      'et': function(n) { return (n!=1) ? 1 : 0; }, // Estonian
      'eu': function(n) { return (n!=1) ? 1 : 0; }, // Basque

      'fa': function(n) { return 0; }, // Persian
      'fi': function(n) { return (n!=1) ? 1 : 0; }, // Finnish
      'fil': function(n) { return (n>1) ? 1 : 0; }, // Filipino
      'fo': function(n) { return (n!=1) ? 1 : 0; }, // Faroese
      'fr': function(n) { return (n>1) ? 1 : 0; }, // French
      'fur': function(n) { return (n!=1) ? 1 : 0; }, // Friulian
      'fy': function(n) { return (n!=1) ? 1 : 0; }, // Frisian

      'ga': function(n) { return n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4; }, // Irish
      'gl': function(n) { return (n!=1) ? 1 : 0; }, // Galician
      'gu': function(n) { return (n!=1) ? 1 : 0; }, // Gujarati
      'gun': function(n) { return (n>1) ? 1 : 0; }, // Gun

      'ha': function(n) { return (n!=1) ? 1 : 0; }, // Hausa
      'he': function(n) { return (n!=1) ? 1 : 0; }, // Hebrew
      'hi': function(n) { return (n!=1) ? 1 : 0; }, // Hindi
      'hy': function(n) { return 0; }, // Armenian
      'hr': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Croatian
      'hu': function(n) { return (n!=1) ? 1 : 0; }, // Hungarian

      'ia': function(n) { return (n!=1) ? 1 : 0; }, // Interlingua
      'id': function(n) { return 0; }, // Indonesian
      'is': function(n) { return (n%10!=1 || n%100==11); }, // Icelandic
      'it': function(n) { return (n!=1) ? 1 : 0; }, // Italian

      'ja': function(n) { return 0; }, // Japanese
      'jv': function(n) { return (n!=0) ? 1 : 0; }, // Javanese

      'ka': function(n) { return 0; }, // Georgian
      'kk': function(n) { return 0; }, // Kazakh
      'km': function(n) { return 0; }, // Khmer
      'kn': function(n) { return (n!=1) ? 1 : 0; }, // Kannada
      'ko': function(n) { return 0; }, // Korean
      'ku': function(n) { return (n!=1) ? 1 : 0; }, // Kurdish
      'kw': function(n) { return (n==1) ? 0 : (n==2) ? 1 : (n==3) ? 2 : 3; }, // Cornish
      'ky': function(n) { return 0; }, // Kyrgyz

      'lb': function(n) { return (n!=1); }, // Letzeburgesch
      'ln': function(n) { return (n>1) ? 1 : 0; }, // Lingala
      'lo': function(n) { return 0; }, // Lao
      'lt': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Lithuanian
      'lv': function(n) { return (n%10==1 && n%100!=11 ? 0 : n!=0 ? 1 : 2); }, // Latvian

      'mfe': function(n) { return (n>1) ? 1 : 0; }, // Mauritian Creole
      'mg': function(n) { return (n>1) ? 1 : 0; }, // Malagasy
      'mi': function(n) { return (n>1) ? 1 : 0; }, // Maori
      'mk': function(n) { return n==1 || n%10==1 ? 0 : 1; }, // Macedonian
      'ml': function(n) { return (n!=1) ? 1 : 0; }, // Malayalam
      'mn': function(n) { return (n!=1) ? 1 : 0; }, // Mongolian
      'mr': function(n) { return (n!=1) ? 1 : 0; }, // Marathi
      'ms': function(n) { return 0; }, // Malay
      'mt': function(n) { return (n==1 ? 0 : n==0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3); }, // Maltese

      'nah': function(n) { return (n!=1) ? 1 : 0; }, // Nahuatl
      'nap': function(n) { return (n!=1) ? 1 : 0; }, // Neapolitan
      'nb': function(n) { return (n!=1) ? 1 : 0; }, // Norwegian Bokmal
      'ne': function(n) { return (n!=1) ? 1 : 0; }, // Nepali
      'nl': function(n) { return (n!=1) ? 1 : 0; }, // Dutch
      'se': function(n) { return (n!=1) ? 1 : 0; }, // Northern Sami
      'nn': function(n) { return (n!=1) ? 1 : 0; }, // Norwegian Nynorsk
      'no': function(n) { return (n!=1) ? 1 : 0; }, // Norwegian (old code)
      'nso': function(n) { return (n!=1) ? 1 : 0; }, // Northern Sotho

      'oc': function(n) { return (n>1) ? 1 : 0; }, // Occitan
      'or': function(n) { return (n!=1) ? 1 : 0; }, // Oriya

      'ps': function(n) { return (n!=1) ? 1 : 0; }, // Pashto
      'pa': function(n) { return (n!=1) ? 1 : 0; }, // Punjabi
      'pap': function(n) { return (n!=1) ? 1 : 0; }, // Papiamento
      'pl': function(n) { return (n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Polish
      'pms': function(n) { return (n!=1) ? 1 : 0; }, // Piemontese
      'pt': function(n) { return (n!=1) ? 1 : 0; }, // Portuguese
      'pt-br': function(n) { return (n>1) ? 1 : 0; }, // Brazilian Portuguese

      'rm': function(n) { return (n!=1); }, // Romansh
      'ro': function(n) { return (n==1 ? 0 : (n==0 || (n%100>0 && n%100<20)) ? 1 : 2); }, // Romanian
      'ru': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Russian

      'sco': function(n) { return (n!=1) ? 1 : 0; }, // Scots
      'si': function(n) { return (n!=1) ? 1 : 0; }, // Sinhala
      'sk': function(n) { return (n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2; }, // Slovak
      'sl': function(n) { return (n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0); }, // Slovenian
      'so': function(n) { return (n!=1) ? 1 : 0; }, // Somali
      'son': function(n) { return 0; }, // Songhay
      'sq': function(n) { return (n!=1) ? 1 : 0; }, // Albanian
      'sr': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Serbian
      'su': function(n) { return 0; }, // Sundanese
      'sw': function(n) { return (n!=1) ? 1 : 0; }, // Swahili
      'sv': function(n) { return (n!=1) ? 1 : 0; }, // Swedish

      'ta': function(n) { return (n!=1) ? 1 : 0; }, // Tamil
      'te': function(n) { return (n!=1) ? 1 : 0; }, // Telugu
      'tg': function(n) { return (n!=1) ? 1 : 0; }, // Tajik
      'ti': function(n) { return (n>1) ? 1 : 0; }, // Tigrinya
      'th': function(n) { return 0; }, // Thai
      'tk': function(n) { return (n!=1) ? 1 : 0; }, // Turkmen
      'tr': function(n) { return 0; }, // Turkish
      'tt': function(n) { return 0; }, // Tatar

      'ug': function(n) { return 0; }, // Uyghur
      'uk': function(n) { return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2); }, // Ukrainian
      'ur': function(n) { return (n!=1) ? 1 : 0; }, // Urdu
      'uz': function(n) { return 0; }, // Uzbek

      'vi': function(n) { return 0; }, // Vietnamese

      'wa': function(n) { return (n>1) ? 1 : 0; }, // Walloon

      'zh': function(n) { return 0; }, // Chinese
      'zh-personal': function(n) { return (n>1) ? 1 : 0; } // Chinese, used in special cases when dealing with personal pronoun
    };

    //
    // Choose the plural function based on locale name
    //
    this.setLocale = function(locale) {
      this.plural = pluralEquations[locale];
    }; // function locale

    this.format = function(s, params, options) {
      if (typeof params != 'object') {
        throw new TypeError("'params' is not a hash");
      }

      if ((typeof options != 'undefined') && (typeof options != 'object')) {
        throw new TypeError("'options' is not a hash");
      }

      options = options || {};

      var pluralFunc = "locale" in options ?
        pluralEquations[options.locale] || pluralEquations.en :
        this.plural;

      addMissingOptions(options, defaultOptions);

      var strict = !!options.strict;
      var autoPlurals = !!options.autoPlurals;
      var callback = options.callback;

      var chunks = s.split(/([\{\}])/);
      var blocks = [''];
      var bracketCount = 0;
      for (var i = 0, chLen = chunks.length; i < chLen; i++) {
        var chunk = chunks[i];

        if (chunk == '{') {
          bracketCount++;
          blocks.push('');
          continue;
        }

        if (chunk == '}') {
          bracketCount--;
          if (bracketCount < 0) {
            throw new SyntaxError('Unmatched } found');
          }
          var block = blocks.pop();
          var colonPos = block.indexOf(':');

          if (strict && (colonPos == 0)) {
            throw new TypeError('Empty placeholder name');
          }

          var name;

          if (colonPos == -1) { // simple placeholder
            name = block;
          } else { // multiple choices
            name = block.substr(0, colonPos);
          }

          if (!(name in params)) {
            var pPos = name.indexOf(_PLURAL);
            if (autoPlurals && (pPos != -1) && (pPos == (name.length - _PLURAL.length))) {
              var prefix = name.substr(0, pPos);
              if (!(prefix in params)) {
                if (callback) {
                  params[prefix] = callback(prefix);
                } else if (strict) {
                  throw new TypeError(
                    "Neither '" + name + "' nor '" + prefix + "' are defined"
                  );
                }
              }

              var prefixValue = parseInt(params[prefix]);
              if (prefixValue != params[prefix] || (prefixValue < 0)) {
                if (strict) {
                  throw new RangeError(
                    "Value of '" + prefix + "' is not a zero or positive integer number"
                  );
                }
                prefixValue = 0;
              }

              params[name] = pluralFunc(prefixValue);
            } else {
              if (callback) {
                params[name] = callback(name);
              } else if (strict) {
                throw new TypeError("'" + name + "' not defined");
              }
            }
          }

          var result;

          if (colonPos == -1) { // simple placeholder
            result = params[name];
          } else { // multiple choices
            var blockLen = block.length;

            if (strict && (colonPos == blockLen - 1)) {
              throw new TypeError('Empty list of variants');
            }

            var choiceIdx = parseInt(params[name]);
            if (choiceIdx != params[name] || (choiceIdx < 0)) {
              if (strict) {
                throw new RangeError(
                  "Value of '" + name + "' is not a zero or positive integer number"
                );
              }
              choiceIdx = 0;
            }
            var n = 0;
            var choiceStart = colonPos + 1;
            var choiceEnd = blockLen;
            var j = -1;

            while ((j = block.indexOf('|', j + 1)) != -1) {
              n++;
              if (n <= choiceIdx) {
                choiceStart = j + 1;
              } else if (n == choiceIdx + 1) {
                choiceEnd = j;
              }
            }
            result = block.substr(choiceStart, choiceEnd - choiceStart);
          }

          blocks[blocks.length - 1] += result;
          continue;
        }
        blocks[blocks.length - 1] += chunk;
      }

      if (bracketCount > 0) {
        throw new SyntaxError('Unmatched { found');
      }

      return blocks[0];
    }; // function format

    // initialize with the provided or default locale ('en')
    this.setLocale(defaultOptions.locale || 'en');
  }

  return Plurr;
}));


/***/ }),

/***/ 456:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-env browser */

/**
 * Extends clipboard.js and handles the Safari case with our own tooltip. Safari users
 * unfortunately need to manually use a keyboard shortcut to perform the clipboard action.
 * Clipboard.js selects the text in a hidden input field on click, so the user can just
 * click on the button and then do command+c. This class adds our Focus tooltip to tell
 * the user to use the shortcut.
 *
 * The default error handler manipulates the DOM to add a tooltip, guiding users to
 * press command+c in Safari. If this default handler is overridden by supplying a
 * custom handle in options.errorHandler, this handler must handle the Safari case.
 */


var _clipboard = __webpack_require__(140);

var _clipboard2 = _interopRequireDefault(_clipboard);

var _lodash = __webpack_require__(107);

var _lodash2 = _interopRequireDefault(_lodash);

var _react = __webpack_require__(8);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(97);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _i18n = __webpack_require__(15);

var _i18n2 = _interopRequireDefault(_i18n);

var _withTooltip = __webpack_require__(252);

var _withTooltip2 = _interopRequireDefault(_withTooltip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Construct a new instance of ClipboardWithTooltip.
 * @param {DOMElement} el A DOM element that, when being clicked, will trigger the
 * process of copying data into clipboard.
 * @param {Object} options An object that has 2 optional fields:
 * - action: a string that is either 'cut' or anything else. If 'cut' is specified, the
 * tooltip will be shown with instruction to cut the text into clipboard. By default,
 * specifying nothing for this field will show an instruction to copy the text into
 * clipboard. Supplying a string to this field only works if errorHandler is not
 * specified.
 * - errorHandler: a function that will get called before
 * ClipboardWithTooltip#on('error', callback) when copying text into clipboard
 * fails. This function must provide instructions to guide users on Safari to use
 * command+c to copy the text. If behavior in addition to creating a tooltip with
 * instructions is needed, don't supply this function and instead use
 * ClipboardWithTooltip#on('error', callback).
 * @constructor
 */
var ClipboardWithTooltip = function () {
  function ClipboardWithTooltip(el, options) {
    _classCallCheck(this, ClipboardWithTooltip);

    options = options || {};
    var self = this;

    self.el = el;
    self.clipboard = new _clipboard2.default(el, options);

    // add container for tooltip
    self.tooltipContainer = document.createElement('div');
    self.tooltipContainer.style.position = 'relative';
    self.tooltipContainer.style.top = '0px';
    self.tooltipContainer.style.bottom = '0px';
    self.tooltipContainer.style.width = '100%';
    self.tooltipContainer.style.height = '100%';
    el.appendChild(self.tooltipContainer);

    self.clipboard.on('error', _lodash2.default.isFunction(options.errorHandler) ? options.errorHandler : self._errorDefaultHandler);

    self.clipboard.on('success', function () {
      self._removeTooltip();
    });

    self.mouseLeaveListener = function () {
      self._removeTooltip();
    };
    el.addEventListener('mouseleave', self.mouseLeaveListener);
  }

  _createClass(ClipboardWithTooltip, [{
    key: 'on',
    value: function on(action, callback) {
      this.clipboard.on(action, callback);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var self = this;
      self._removeTooltip();
      self.el.removeChild(self.tooltipContainer);
      self.el.removeEventListener('mouseleave', self.mouseLeaveListener);
      this.clipboard.destroy();
    }
  }, {
    key: '_removeTooltip',
    value: function _removeTooltip() {
      var self = this;
      _reactDom2.default.unmountComponentAtNode(self.tooltipContainer);
    }
  }, {
    key: '_getTooltipString',
    value: function _getTooltipString(action) {
      return action === 'cut' ? _i18n2.default.L('ClipboardWithTooltip.instructionsToCut') : _i18n2.default.L('ClipboardWithTooltip.instructionsToCopy');
    }

    /*
     * Insert a tooltip into `tooltipContainer` with instruction to copy data into
     * clipboard as label. This handles the Safari case.
     */

  }, {
    key: '_errorDefaultHandler',
    value: function _errorDefaultHandler() {
      var self = this;
      // this is Safari, the text to cut/copy is selected, let the user know what to do
      self._removeTooltip();
      var tooltipString = self._getTooltipString(self.options.action);
      var tooltip = _react2.default.createElement(
        _withTooltip2.default,
        { label: tooltipString },
        _react2.default.createElement('div', null)
      );
      var tooltipInstance = _reactDom2.default.render(tooltip, self.tooltipContainer);
      tooltipInstance.showTooltip();
    }
  }]);

  return ClipboardWithTooltip;
}();

exports.default = ClipboardWithTooltip;
module.exports = exports['default'];

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ }),

/***/ 97:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_97__;

/***/ })

/******/ })});;