/*!
 * vuex-weex based on Vuex v2.0.0-rc.3
 * (c) 2016-07 Majiuxi Cha inspired by Evan You
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vuex = factory());
}(this, function () { 'use strict';

  function mapState(map) {
    var res = {};
    Object.keys(map).forEach(function (key) {
      var fn = map[key];
      res[key] = function mappedState() {
        return fn.call(this, this.$store.state, this.$store.getters);
      };
    });
    return res;
  }

  function mapMutations(mutations) {
    var res = {};
    normalizeMap(mutations).forEach(function (_ref) {
      var key = _ref.key;
      var val = _ref.val;

      res[key] = function mappedMutation() {
        var _$store;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return (_$store = this.$store).commit.apply(_$store, [val].concat(args));
      };
    });
    return res;
  }

  function mapGetters(getters) {
    var res = {};
    normalizeMap(getters).forEach(function (_ref2) {
      var key = _ref2.key;
      var val = _ref2.val;

      res[key] = function mappedGetter() {
        if (!(val in this.$store.getters)) {
          console.error("[vuex] unknown getter: " + val);
        }
        return this.$store.getters[val];
      };
    });
    return res;
  }

  function mapActions(actions) {
    var res = {};
    normalizeMap(actions).forEach(function (_ref3) {
      var key = _ref3.key;
      var val = _ref3.val;

      res[key] = function mappedAction() {
        var _$store2;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return (_$store2 = this.$store).dispatch.apply(_$store2, [val].concat(args));
      };
    });
    return res;
  }

  function normalizeMap(map) {
    return Array.isArray(map) ? map.map(function (key) {
      return { key: key, val: key };
    }) : Object.keys(map).map(function (key) {
      return { key: key, val: map[key] };
    });
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
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

  // var Vue = void 0; // bind on install

  var Store = function () {
    function Store() {
      var _this = this;
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      classCallCheck(this, Store);
      // assert(Vue, 'must call Vue.use(Vuex) before creating a store instance.');
      assert(typeof Promise !== 'undefined', 'vuex requires a Promise polyfill in this browser.');

      var _options$state = options.state;
      var state = _options$state === undefined ? {} : _options$state;
      var _options$modules = options.modules;
      var modules = _options$modules === undefined ? {} : _options$modules;
      var _options$plugins = options.plugins;
      var plugins = _options$plugins === undefined ? [] : _options$plugins;
      var _options$strict = options.strict;
      var strict = _options$strict === undefined ? false : _options$strict;

      // store internal state

      this._options = options;
      this._committing = false;
      this._actions = Object.create(null);
      this._mutations = Object.create(null);
      this._subscribers = [];
      this._pendingActions = [];

      // bind commit and dispatch to self
      var store = this;
      var dispatch = this.dispatch;
      var commit = this.commit;

      this.dispatch = function boundDispatch(type, payload) {
        return dispatch.call(store, type, payload);
      };
      this.commit = function boundCommit(type, payload) {
        return commit.call(store, type, payload);
      };

      // init state and getters
      var getters = extractModuleGetters(options.getters, modules);
      initStoreState(this, state, getters);

      // apply root module
      this.module([], options);

      plugins.forEach(function (plugin) {
        return plugin(_this);
      });
    }

    createClass(Store, [{
      key: 'replaceState',
      value: function replaceState(state) {
        this._committing = true;
        this._vm.state = state;
        this._committing = false;
      }
    }, {
      key: 'module',
      value: function module(path, _module, hot) {
        var _this2 = this;

        this._committing = true;
        if (typeof path === 'string') path = [path];
        assert(Array.isArray(path), 'module path must be a string or an Array.');

        var isRoot = !path.length;
        var state = _module.state;
        var actions = _module.actions;
        var mutations = _module.mutations;
        var modules = _module.modules;

        // set state

        if (!isRoot && !hot) {
          var parentState = getNestedState(this.state, path.slice(0, -1));
          if (!parentState) debugger;
          var moduleName = path[path.length - 1];
          // Vue.set(parentState, moduleName, state || {});
        }

        if (mutations) {
          Object.keys(mutations).forEach(function (key) {
            _this2.mutation(key, mutations[key], path);
          });
        }

        if (actions) {
          Object.keys(actions).forEach(function (key) {
            _this2.action(key, actions[key], path);
          });
        }

        if (modules) {
          Object.keys(modules).forEach(function (key) {
            _this2.module(path.concat(key), modules[key], hot);
          });
        }
        this._committing = false;
      }
    }, {
      key: 'mutation',
      value: function mutation(type, handler) {
        var path = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        var entry = this._mutations[type] || (this._mutations[type] = []);
        var store = this;
        entry.push(function wrappedMutationHandler(payload) {
          handler(getNestedState(store.state, path), payload);
        });
      }
    }, {
      key: 'action',
      value: function action(type, handler) {
        var path = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        var entry = this._actions[type] || (this._actions[type] = []);
        var store = this;
        var dispatch = this.dispatch;
        var commit = this.commit;

        entry.push(function wrappedActionHandler(payload, cb) {
          var res = handler({
            dispatch: dispatch,
            commit: commit,
            getters: store.getters,
            state: getNestedState(store.state, path),
            rootState: store.state
          }, payload, cb);
          if (!isPromise(res)) {
            res = Promise.resolve(res);
          }
          return res;
        });
      }
    }, {
      key: 'commit',
      value: function commit(type, payload) {
        var _this3 = this;

        // check object-style commit
        var mutation = void 0;
        if (isObject(type) && type.type) {
          payload = mutation = type;
          type = type.type;
        } else {
          mutation = { type: type, payload: payload };
        }
        var entry = this._mutations[type];
        if (!entry) {
          console.error('[vuex] unknown mutation type: ' + type);
          return;
        }
        this._committing = true;
        entry.forEach(function commitIterator(handler) {
          handler(payload);
        });
        this._committing = false;
        if (!payload || !payload.silent) {
          this._subscribers.forEach(function (sub) {
            return sub(mutation, _this3.state);
          });
        }
      }
    }, {
      key: 'dispatch',
      value: function dispatch(type, payload) {
        var entry = this._actions[type];
        if (!entry) {
          console.error('[vuex] unknown action type: ' + type);
          return;
        }
        var res = entry.length > 1 ? Promise.all(entry.map(function (handler) {
          return handler(payload);
        })) : entry[0](payload);
        var pending = this._pendingActions;
        pending.push(res);
        return res.then(function (value) {
          pending.splice(pending.indexOf(res), 1);
          return value;
        });
        return res;
      }
    }, {
      key: 'onActionsResolved',
      value: function onActionsResolved(cb) {
        Promise.all(this._pendingActions).then(cb);
      }
    }, {
      key: 'subscribe',
      value: function subscribe(fn) {
        var subs = this._subscribers;
        if (subs.indexOf(fn) < 0) {
          subs.push(fn);
        }
        return function () {
          var i = subs.indexOf(fn);
          if (i > -1) {
            subs.splice(i, 1);
          }
        };
      }
    }, {
      key: 'watch',
      value: function watch(getter, cb, options) {
        var _this4 = this;

        assert(typeof getter === 'function', 'store.watch only accepts a function.');
        return this._vm.$watch(function () {
          return getter(_this4.state);
        }, cb, options);
      }
    }, {
      key: 'hotUpdate',
      value: function hotUpdate(newOptions) {
        var _this5 = this;

        this._actions = Object.create(null);
        this._mutations = Object.create(null);
        var options = this._options;
        if (newOptions.actions) {
          options.actions = newOptions.actions;
        }
        if (newOptions.mutations) {
          options.mutations = newOptions.mutations;
        }
        if (newOptions.modules) {
          for (var key in newOptions.modules) {
            options.modules[key] = newOptions.modules[key];
          }
        }
        this.module([], options, true);

        // update getters
        var getters = extractModuleGetters(newOptions.getters, newOptions.modules);
        if (Object.keys(getters).length) {
          (function () {
            var oldVm = _this5._vm;
            initStoreState(_this5, _this5.state, getters);
            // dispatch changes in all subscribed watchers
            // to force getter re-evaluation.
            _this5._committing = true;
            oldVm.state = null;
            _this5._committing = false;
          })();
        }
      }
    }, {
      key: 'state',
      get: function get() {
        return this._vm.state;
      },
      set: function set(v) {
        assert(false, 'Use store.replaceState() to explicit replace store state.');
      }
    }]);
    return Store;
  }();

  function assert(condition, msg) {
    if (!condition) throw new Error('[vuex] ' + msg);
  }

  function initStoreState(store, state, getters) {
    // bind getters
    store.getters = {};
    Object.keys(getters).forEach(function (key) {
      Object.defineProperty(store.getters, key, {
        get: function get() {
          console.log('store.getters.months:', store._vm.getters[key](store))
          return store._vm.getters[key](store);
        }
      });
    });

    store._vm = {
      state: state,
      getters: getters
    };
  }

  function extractModuleGetters() {
    var getters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var modules = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var path = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (!modules) {
      return getters;
    }
    Object.keys(modules).forEach(function (key) {
      var module = modules[key];
      var modulePath = path.concat(key);
      extractModuleGetters(getters, module.modules, modulePath);
    });
    return getters;
  }

  function isObject(obj) {
    return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
  }

  function isPromise(val) {
    return val && typeof val.then === 'function';
  }

  function getNestedState(state, path) {
    return path.length ? path.reduce(function (state, key) {
      return state[key];
    }, state) : state;
  }

  var index = {
    Store: Store,
    mapState: mapState,
    mapMutations: mapMutations,
    mapGetters: mapGetters,
    mapActions: mapActions
  };

  return index;

}));
