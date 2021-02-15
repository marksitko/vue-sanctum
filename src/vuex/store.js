export default {
    namespaced: true,
    state: {
        user: {},
        isAuthenticated: false,
        hasXSRFToken: false,
    },
    mutations: {
        setUser(state, user) {
            // check if user state is empty to only fire the initialized user event once
            const shouldInitialize = Object.keys(state.user).length === 0;

            state.user = user;
            if (shouldInitialize) {
                this._vm.$sanctum.eventBus.$emit('sanctum:userInitialized', user);
            }
        },
        updateAuthenticatedState(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
            if (isAuthenticated) {
                this._vm.$sanctum.eventBus.$emit('sanctum:authenticated', isAuthenticated);
            }
        },
        updateXSRFTokenState(state, hasToken) {
            state.hasXSRFToken = hasToken;
        },
        clear(state) {
            state.user = {};
            this._vm.$sanctum.eventBus.$emit('sanctum:loggedOut');
        },
    },
    actions: {
        login({ commit, dispatch }, credentials) {
            return this._vm.$sanctum.login(credentials).then(({ data }) => {
                commit('updateXSRFTokenState', this._vm.$sanctum.hasXSRFToken());
                if (this._vm.$sanctum.options.fetchUserAfterLogin) {
                    dispatch('fetchUser');
                }
                return data;
            });
        },
        fetchUser({ commit }) {
            return this._vm.$sanctum.me().then(({ data }) => {
                commit('setUser', data);
                commit('updateAuthenticatedState', true);
                return data;
            });
        },
        logout({ dispatch }) {
            return this._vm.$sanctum.logout().finally(() => {
                dispatch('clear');
            });
        },
        tryAutoLogin({ dispatch, getters }) {
            if (!getters.hasXSRFToken) {
                return Promise.reject();
            }
            return dispatch('fetchUser').catch(error => {
                dispatch('clear');
                throw error;
            });
        },
        clear({ commit }) {
            commit('updateXSRFTokenState', false);
            commit('updateAuthenticatedState', false);
            commit('clear');
        },
    },
    getters: {
        getUser(state) {
            return state.user;
        },
        isAuthenticated(state) {
            return state.isAuthenticated;
        },
        hasXSRFToken(state) {
            return state.hasXSRFToken;
        },
    },
};
