import { hasCookie, deleteCookie } from './utils';
import sanctum from './vuex/store';

export default {
    install(Vue, options) {
        const defaults = {
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
                me: 'me',
            },
        };

        const finalOptions = {
            ...defaults,
            ...options,
            routes: {
                ...defaults.routes,
                ...options.routes,
            },
        };

        const { axios, store, eventBus, xsrfToken, storeModuleName, routes } = finalOptions;

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
                return axios.get(routes.csrf);
            },
            login(credentials) {
                return this.fetchCSRFToken().then(() => {
                    return axios.post(routes.login, credentials);
                });
            },
            logout() {
                return axios.post(routes.logout).finally(() => {
                    deleteCookie(xsrfToken);
                });
            },
            me() {
                return axios.get(routes.me);
            },
            hasXSRFToken() {
                return hasCookie(xsrfToken);
            },
            eventBus: _eventBus,
            options: finalOptions,
        };

        // if store is passed, register the sanctum module.
        // set immediately the XSRF-Token state, this is required for the tryAutoLogin action.
        if (store) {
            store.registerModule(storeModuleName, sanctum);
            store.commit(`${storeModuleName}/updateXSRFTokenState`, hasCookie(xsrfToken));
        }
    },
};

export { setCookie, hasCookie, deleteCookie, currentWildcardDomain } from './utils';
