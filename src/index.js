const defaults = {
    axios: null,
    routes: {
        csrf: 'sanctum/csrf-cookie',
        login: 'login',
        logout: 'logout',
    },
    xsrfCookieName: 'XSRF-TOKEN',
};

export const currentWildcardDomain = () => window.location.hostname.substr(window.location.hostname.indexOf('.'));
export const setCookie = (name, value, days) => {
    const d = new Date();
    const domain = currentWildcardDomain();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = `${name}=${value};domain=${domain};path=/;expires=${d.toGMTString()}`;
};
export const hasCookie = name => document.cookie.indexOf(name) !== -1;
export const deleteCookie = name => { setCookie(name, '', -1); };

export default {
    install(Vue, options) {
        const { axios, routes, xsrfCookieName } = {
            ...defaults,
            ...options,
            routes: {
                ...defaults.routes,
                ...options.routes,
            }
        };

        if (!axios || typeof axios !== 'functions') {
            console.error('vue-sanctum requires an axios instance');
            return;
        }

        Vue.prototype.$sanctum = {
            fetchCsrfCookie() {
                return new Promise((resolve, reject) => {
                    axios.get(routes.csrf)
                        .then(data => {
                            resolve(data);
                        })
                        .catch(error => reject(error));
                });
            },
            login(credentials) {
                return new Promise((resolve, reject) => {
                    this.fetchCsrfCookie()
                        .then(() => {
                            axios.post(routes.login, credentials)
                                .then(({ data }) => {
                                    resolve(data);
                                })
                                .catch(error => reject(error));
                        })
                        .catch(error => reject(error));
                });
            },
            logout() {
                return new Promise((resolve, reject) => {
                    axios.post('logout')
                        .then(({ data }) => {
                            resolve(data);
                        })
                        .catch(error => reject(error))
                        .finally(() => {
                            deleteCookie(xsrfCookieName)
                        });
                });
            },
            hasXsrfToken() {
                return hasCookie(xsrfCookieName);
            }
        }
    }
};
