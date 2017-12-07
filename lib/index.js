'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPropsGetter = exports.getProps = undefined;

var _pick2 = require('lodash/pick');

var _pick3 = _interopRequireDefault(_pick2);

var _mapValues2 = require('lodash/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _flattenDeep2 = require('lodash/flattenDeep');

var _flattenDeep3 = _interopRequireDefault(_flattenDeep2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.toDispatch = toDispatch;
exports.runControllerGenerator = runControllerGenerator;
exports.controller = controller;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _selector_utils = require('./selector_utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var toDispatchSymbol = Symbol('toDispatch');

/** Request to get the props object at a specific time */
var getProps = exports.getProps = Symbol('getProps');

/**
 * Request to get a function that will return the controller `props` object,
 * when called.
 */
var getPropsGetter = exports.getPropsGetter = Symbol('getPropsGetter');

/**
 * Convenience request to dispatch an action directly from a controller
 * generator.
 * @param  {*} action a Redux action
 * @return {*} the result of dispatching the action
 */
function toDispatch(action) {
  return _defineProperty({}, toDispatchSymbol, action);
}

/**
 * The default function for converting the controllerGenerators to methods that
 * can be directly called. It resolves `yield` statements in the generators by
 * delegating Promise to `co` and processing special values that are used to
 * request data from the controller.
 * @param  {Function} propsGetter gets the current controller props.
 * @return {Function} a function that converts a generator to a method
 *   forwarding on the arguments the generator receives.
 */
function runControllerGenerator(propsGetter) {
  return function (controllerGenerator) {
    return _co2.default.wrap( /*#__PURE__*/regeneratorRuntime.mark(function coWrapper() {
      var gen,
          value,
          done,
          toController,
          _gen$next,
          _gen$next2,
          props,
          _args = arguments;

      return regeneratorRuntime.wrap(function coWrapper$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              gen = controllerGenerator.apply(this, _args);
              value = void 0;
              done = void 0;
              toController = void 0;
              _gen$next = gen.next(), value = _gen$next.value, done = _gen$next.done, _gen$next;

            case 5:
              if (done) {
                _context.next = 31;
                break;
              }

              props = propsGetter();

              // In the special cases that the yielded value has one of our special
              // tags, process it, and then we'll send the result on to `co` anyway
              // in case whatever we get back is a promise.

              if (!(value && value[toDispatchSymbol])) {
                _context.next = 11;
                break;
              }

              // Dispatch an action
              toController = props.dispatch(value[toDispatchSymbol]);
              _context.next = 28;
              break;

            case 11:
              if (!(value === getProps)) {
                _context.next = 15;
                break;
              }

              // Return all props
              toController = props;
              _context.next = 28;
              break;

            case 15:
              if (!(value === getPropsGetter)) {
                _context.next = 19;
                break;
              }

              // Return the propsGetter itself, so the controller can get props
              // values in async continuations
              toController = propsGetter;
              _context.next = 28;
              break;

            case 19:
              _context.prev = 19;
              _context.next = 22;
              return value;

            case 22:
              toController = _context.sent;
              _context.next = 28;
              break;

            case 25:
              _context.prev = 25;
              _context.t0 = _context['catch'](19);

              gen.throw(_context.t0);

            case 28:
              _gen$next2 = gen.next(toController), value = _gen$next2.value, done = _gen$next2.done, _gen$next2;
              _context.next = 5;
              break;

            case 31:
              return _context.abrupt('return', value);

            case 32:
            case 'end':
              return _context.stop();
          }
        }
      }, coWrapper, this, [[19, 25]]);
    }));
  };
}

/**
 * This higher-order component introduces a concept of a Controller, which is a
 * component that acts as an interface between the proper view component tree
 * and the Redux state modeling, building upon react-redux. It attempts to
 * solve a couple problems:
 *
 * - It provides a way for event handlers and other helpers to access the
 *   application state and dispatch actions to Redux.
 * - It conveys those handlers, along with the data from the react-redux
 *   selectors, to the component tree, using React's [context](bit.ly/1QWHEfC)
 *   feature.
 *
 * It was designed to help keep UI components as simple and domain-focused
 * as possible (i.e. [dumb components](bit.ly/1RFh7Ui), while concentrating
 * the React-Redux integration point at a single place. It frees intermediate
 * components from the concern of routing dependencies to their descendents,
 * reducing coupling of components to the UI layout.
 *
 * @param  {React.Component} RootComponent is the root of the app's component
 *   tree.
 * @param  {Object} controllerGenerators contains generator methods to be used
 *   to create controller methods, which are distributed to the component tree.
 *   These are called from UI components to trigger state changes. These
 *   generators can `yield` Promises to be resolved via `co`, can `yield`
 *   requests to receive application state or dispatch actions, and can
 *   `yield*` to delegate to other controller generators.
 * @param  {(Object|Object[])} selectorBundles maps property names to selector
 *   functions, which produce property value from the Redux store.
 * @param  {Function} [controllerGeneratorRunner = runControllerGenerator] is
 *   the generator wrapper that will be used to run the generator methods.
 * @return {React.Component} a decorated version of RootComponent, with
 *   `context` set up for its descendants.
 */
function controller(RootComponent, controllerGenerators, selectorBundles) {
  var controllerGeneratorRunner = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : runControllerGenerator;

  // Combine selector bundles into one mapStateToProps function.
  var mapStateToProps = (0, _selector_utils.aggregateSelectors)(Object.assign.apply(Object, [{}].concat(_toConsumableArray((0, _flattenDeep3.default)([selectorBundles])))));
  var selectorPropTypes = mapStateToProps.propTypes;

  // All the controller method propTypes should simply be "function" so we can
  // synthesize those.
  var controllerMethodPropTypes = (0, _mapValues3.default)(controllerGenerators, function () {
    return _propTypes2.default.func.isRequired;
  });

  // Declare the availability of all of the selectors and controller methods
  // in the React context for descendant components.
  var contextPropTypes = _extends({}, selectorPropTypes, controllerMethodPropTypes);

  var Controller = function (_React$Component) {
    _inherits(Controller, _React$Component);

    function Controller() {
      var _ref2;

      _classCallCheck(this, Controller);

      for (var _len = arguments.length, constructorArgs = Array(_len), _key = 0; _key < _len; _key++) {
        constructorArgs[_key] = arguments[_key];
      }

      var _this = _possibleConstructorReturn(this, (_ref2 = Controller.__proto__ || Object.getPrototypeOf(Controller)).call.apply(_ref2, [this].concat(constructorArgs)));

      var injectedControllerGeneratorRunner = controllerGeneratorRunner(function () {
        return _this.props;
      });
      _this.controllerMethods = (0, _mapValues3.default)(controllerGenerators, function (controllerGenerator) {
        return injectedControllerGeneratorRunner(controllerGenerator);
      });

      // Ensure controller methods can access each other via `this`
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(_this.controllerMethods)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var methodName = _step.value;

          _this.controllerMethods[methodName] = _this.controllerMethods[methodName].bind(_this.controllerMethods);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return _this;
    }

    _createClass(Controller, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        if (this.controllerMethods.initialize) {
          this.controllerMethods.initialize();
        }
      }
    }, {
      key: 'componentWillUnMount',
      value: function componentWillUnMount() {
        if (this.controllerMethods.deinitialize) {
          this.controllerMethods.deinitialize();
        }
      }
    }, {
      key: 'getChildContext',
      value: function getChildContext() {
        // Rather than injecting all of the RootComponent props into the context,
        // we only explicitly pass selector and controller method props.
        var selectorProps = (0, _pick3.default)(this.props, Object.keys(selectorPropTypes));
        return _extends({}, selectorProps, this.controllerMethods);
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(RootComponent, this.props);
      }
    }]);

    return Controller;
  }(_react2.default.Component);

  Controller.propTypes = _extends({}, selectorPropTypes, RootComponent.propTypes || {});
  Controller.childContextTypes = contextPropTypes;

  return (0, _reactRedux.connect)(mapStateToProps)(Controller);
}