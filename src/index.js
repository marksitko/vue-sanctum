import { hasCookie, deleteCookie } from './utils';
import sanctum from './vuex/store';

export default {
    install(Vue, options) {
        const defaults = {
            axios: null,
            store: null,
            eventBus: null,
            xsrfToken: 'XSRF-TOKEN',
            storeModuleName: 'sanctum',
            routes: {
                csrf: 'sanctum/csrf-cookie',
                login: 'login',
                logout: 'logout',
                me: 'me',
            },
        };

        const { axios, store, eventBus, xsrfToken, storeModuleName, routes } = {
            ...defaults,
            ...options,
            routes: {
                ...defaults.routes,
                ...options.routes,
            },
        };

        // this is the minimum required option
        if (!axios || typeof axios !== 'function') {
            throw new Error('[vue-sanctum] It requires an axios instance.');
        }

        const _eventBus = eventBus ?? new Vue();
        // if eventBus is not passed, attach a own one to the window object
        if (!eventBus) {
            window.sanctumEventBus = _eventBus;
        }

        Vue.prototype.$sanctum = {
            fetchCSRFToken() {
                return new Promise((resolve, reject) => {
                    axios
                        .get(routes.csrf)
                        .then(response => {
                            resolve(response);
                        })
                        .catch(error => reject(error));
                });
            },
            login(credentials) {
                return new Promise((resolve, reject) => {
                    this.fetchCSRFToken()
                        .then(() => {
                            axios
                                .post(routes.login, credentials)
                                .then(response => {
                                    resolve(response);
                                })
                                .catch(error => reject(error));
                        })
                        .catch(error => reject(error));
                });
            },
            logout() {
                return new Promise((resolve, reject) => {
                    axios
                        .post(routes.logout)
                        .then(response => {
                            resolve(response);
                        })
                        .catch(error => reject(error))
                        .finally(() => {
                            deleteCookie(xsrfToken);
                        });
                });
            },
            me() {
                return new Promise((resolve, reject) => {
                    axios
                        .get(routes.me)
                        .then(response => {
                            resolve(response);
                        })
                        .catch(error => reject(error));
                });
            },
            hasXSRFToken() {
                return hasCookie(xsrfToken);
            },
            eventBus: _eventBus,
        };

        // if store is passed, register the sanctum module.
        // set immediately the XSRF-Token state, this is required for the tryAutoLogin action.
        if (store) {
            store.registerModule(storeModuleName, sanctum);
            store.commit(`${storeModuleName}/updateXSRFTokenState`, hasCookie(xsrfToken));
        }
    },
};
