/*!
 * vue-sanctum v1.0.2
 * (c) Mark Sitko <hey@marksitko.de>
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var currentWildcardDomain = function currentWildcardDomain() {
  return window.location.hostname.substr(window.location.hostname.indexOf('.'));
};
var setCookie = function setCookie(name, value, days) {
  var d = new Date();
  var domain = currentWildcardDomain();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = "".concat(name, "=").concat(value, ";domain=").concat(domain, ";path=/;expires=").concat(d.toGMTString());
};
var hasCookie = function hasCookie(name) {
  return document.cookie.indexOf(name) !== -1;
};
var deleteCookie = function deleteCookie(name) {
  setCookie(name, '', -1);
};

var sanctum = {
  namespaced: true,
  state: {
    user: {},
    isAuthenticated: false,
    hasXSRFToken: false
  },
  mutations: {
    setUser: function setUser(state, user) {
      // check if user state is empty to only fire the initialized user event once
      var shouldInitialize = Object.keys(state.user).length === 0;
      state.user = user;

      if (shouldInitialize) {
        this._vm.$sanctum.eventBus.$emit('sanctum:userInitialized', user);
      }
    },
    updateAuthenticatedState: function updateAuthenticatedState(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;

      if (isAuthenticated) {
        this._vm.$sanctum.eventBus.$emit('sanctum:authenticated', isAuthenticated);
      }
    },
    updateXSRFTokenState: function updateXSRFTokenState(state, hasToken) {
      state.hasXSRFToken = hasToken;
    },
    clear: function clear(state) {
      state.user = {};

      this._vm.$sanctum.eventBus.$emit('sanctum:loggedOut');
    }
  },
  actions: {
    login: function login(_ref, credentials) {
      var _this = this;

      var commit = _ref.commit,
          dispatch = _ref.dispatch;
      return this._vm.$sanctum.login(credentials).then(function (_ref2) {
        var data = _ref2.data;
        commit('updateXSRFTokenState', _this._vm.$sanctum.hasXSRFToken());

        if (_this._vm.$sanctum.options.fetchUserAfterLogin) {
          dispatch('fetchUser');
        }

        return data;
      });
    },
    fetchUser: function fetchUser(_ref3) {
      var commit = _ref3.commit;
      return this._vm.$sanctum.me().then(function (_ref4) {
        var data = _ref4.data;
        commit('setUser', data);
        commit('updateAuthenticatedState', true);
        return data;
      });
    },
    logout: function logout(_ref5) {
      var dispatch = _ref5.dispatch;
      return this._vm.$sanctum.logout()["finally"](function () {
        dispatch('clear');
      });
    },
    tryAutoLogin: function tryAutoLogin(_ref6) {
      var dispatch = _ref6.dispatch,
          getters = _ref6.getters;

      if (!getters.hasXSRFToken) {
        return Promise.reject();
      }

      return dispatch('fetchUser')["catch"](function (error) {
        dispatch('clear');
        throw error;
      });
    },
    clear: function clear(_ref7) {
      var commit = _ref7.commit;
      commit('updateXSRFTokenState', false);
      commit('updateAuthenticatedState', false);
      commit('clear');
    }
  },
  getters: {
    getUser: function getUser(state) {
      return state.user;
    },
    isAuthenticated: function isAuthenticated(state) {
      return state.isAuthenticated;
    },
    hasXSRFToken: function hasXSRFToken(state) {
      return state.hasXSRFToken;
    }
  }
};

var index = {
  install: function install(Vue, options) {
    var defaults = {
      axios: null,
      store: null,
      eventBus: null,
      fetchUserAfterLogin: true,
      xsrfToken: 'XSRF-TOKEN',
      storeModuleName: 'sanctum',
      routes: {
        csrf: 'sanctum/csrf-cookie',
        login: 'login',
        logout: 'logout',
        me: 'me'
      }
    };
    var finalOptions = Object.assign({}, defaults, options, {
      routes: Object.assign({}, defaults.routes, options.routes)
    });
    var axios = finalOptions.axios,
        store = finalOptions.store,
        eventBus = finalOptions.eventBus,
        xsrfToken = finalOptions.xsrfToken,
        storeModuleName = finalOptions.storeModuleName,
        routes = finalOptions.routes; // this is the minimum required option

    if (!axios || typeof axios !== 'function') {
      throw new Error('[vue-sanctum] It requires an axios instance.');
    }

    var _eventBus = eventBus !== null && eventBus !== void 0 ? eventBus : new Vue(); // if eventBus is not passed, attach a own one to the window object


    if (!eventBus) {
      window.sanctumEventBus = _eventBus;
    }

    Vue.prototype.$sanctum = {
      fetchCSRFToken: function fetchCSRFToken() {
        return axios.get(routes.csrf);
      },
      login: function login(credentials) {
        return this.fetchCSRFToken().then(function () {
          return axios.post(routes.login, credentials);
        });
      },
      logout: function logout() {
        return axios.post(routes.logout)["finally"](function () {
          deleteCookie(xsrfToken);
        });
      },
      me: function me() {
        return axios.get(routes.me);
      },
      hasXSRFToken: function hasXSRFToken() {
        return hasCookie(xsrfToken);
      },
      eventBus: _eventBus,
      options: finalOptions
    }; // if store is passed, register the sanctum module.
    // set immediately the XSRF-Token state, this is required for the tryAutoLogin action.

    if (store) {
      store.registerModule(storeModuleName, sanctum);
      store.commit("".concat(storeModuleName, "/updateXSRFTokenState"), hasCookie(xsrfToken));
    }
  }
};

exports.currentWildcardDomain = currentWildcardDomain;
exports.default = index;
exports.deleteCookie = deleteCookie;
exports.hasCookie = hasCookie;
exports.setCookie = setCookie;
