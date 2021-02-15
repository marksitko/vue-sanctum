# VueSanctum
VueSanctum is an adapter for the [Laravel Sanctum](https://laravel.com/docs/8.x/sanctum) Authentication flow for SPA's. The Plugin takes care to fetch the CSRF-Token and can manage your Application state if the user is authenticated or not.  

## Pre-Requirements
The only requirement is to have an axios instance which must be passed as plugin option.

## ⏩ Quickstart

### 1. Installation:
```sh
npm install vue-sanctum
```

### 2. Setup:
```javascript
import VueSanctum from 'vue-sanctum';

// you have to have to create an axios instance
// with configured baseURL
// and `withCredentials: true`

Vue.use(VueSanctum, {
    axios: axios
});
```

### 3. Usage:
```vue
<script>
    export default {
        data() {
            return {
                credentials: {
                    email: null,
                    password: null,
                },
            };
        },
        methods: {
            onLogin() {
                this.$sanctum.login(this.credentials)
                    .then(response => {
                        // now you are logged in
                        // the XSRF-Token was fetched and stored
                        // and also the session cookie stored
                        // all further subsequent request are authenticated
                    })
                    .catch(error => {
                        // whoops, something went wrong
                    });
            },
            fetchLoggedUser() {
                this.$sanctum.me()
                    .then(response => {
                        // the current logged-in user is returned
                    })
                    .catch(error => {
                        // whoops, something went wrong
                    });
            },
            onLogout() {
                this.$sanctum.logout()
                    .then(response => {
                        // now you are logged out
                        // and the XSRF-Token are deleted
                    })
                    .catch(error => {
                        // whoops, something went wrong
                    });
            },
        },
    }
</script>
```
## 🚀 Powerful start with Vuex

### 1. Installation:
```sh
npm install vue-sanctum
```

### 2. Setup:
```javascript
import Vue from 'vue';
import VueSanctum from 'vue-sanctum';
import axios from 'axios';
import router from './router';
import store from './store';

/**
* Create your axios instance
const axiosInstance = axios.create({
    baseURL: 'http://sanctum.dev',
    withCredentials: true,
    ...
}) 
*/

// pass in the store to activate the vuex sanctum module.
Vue.use(VueSanctum, {
    axios: axiosInstance,
    store,
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
```

### Usage:
```vue
<template>
    <div>
        <p v-if="isAuthenticated">Hello {{ user.name}}!</p>
        <p v-else>You are not logged in</p>
        <!-- Your login form  -->
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
  data() {
    return {
      credentials: {
        email: null,
        password: null,
      },
    };
  },

  computed: {
    ...mapGetters({
      isAuthenticated: 'sanctum/isAuthenticated',
      user: 'sanctum/getUser',
    }),
  },

  methods: {
    ...mapActions({
      login: 'sanctum/login',
      logout: 'sanctum/logout',
    }),
    onLogin() {
      this.login(this.credentials)
        .then(data => {
            // now you are logged in
            // the XSRF-Token was fetched and stored
            // and also the session cookie stored
            // all further subsequent request are authenticated

            // with activated vuex feature the login action on success
            // dispatch automatically the fetchUser action and store 
            // the authenticated user in the vuex store.
            // It also set the isAuthenticated state to true
            // so you can check anywhere in your application if the user is authenticated or not
        })
        .catch(error => {
           // whoops, something went wrong
        });
    },
    onLogout() {
      this.logout()
        .then(response => {
            // now you are logged out
            // and the state of the vuex sanctum module are cleared.
        })
        .catch(error => {
            // whoops, something went wrong
        });
    },
  },

};
</script>
```


### 🔥 Auto-Login Feautre:
The activated `Vuex` feature provides a `tryAutoLogin()` action. It will check if the `XSRF-Token` are already exists, then try to fetch the mightly authenticated user. If the session cookie is not expired it will store the authentiacted user in the `vuex store` and set the `isAuthenticated` state to `true`. 
It is recommended to dispatch this action directly in the `created()` hook in your `App.vue` file.
```vue
<script>
import {  mapActions } from 'vuex';

export default {
    name: 'App',
    methods: {
        ...mapActions({
            tryAutoLogin: 'sanctum/tryAutoLogin',
        }),
    },
    created() {
        this.tryAutoLogin();
    },
};
</script>
```

---
## ⚙️ VueSanctum Options
Use options to customize VueSanctum.
| Option name            | Type       | Required | Default               | Description |
| -----------------      | ---------- | ---------|-----------------------|-------------|
| `axios`                | `Function` | `true`   | `null`                | The axios instance is used to make request to your backend. |
| `store`                | `Function` | `false`  | `null`                | If the `Vuex store` instance is passed it will automatically activate the `VueSanctum Vuex feature` and register per default a `sanctum` namespaced module. |
| `eventBus`             | `Function` | `false`  | `null`                | If you have defined an own `eventBus` app instance, you can pass it to `VueSanctum`, otherwise it will register an own `sanctumEventBus` to the global `window` object. |
| `fetchUserAfterLogin` | `Boolean`   | `false`  | `true`               | Works only in combination with the `Vuex feature`. If option is enabled, it will fetch and set the user to the store directly after the login action. |
| `xsrfToken`           | `String`   | `false`  | `XSRF-TOKEN`          | The name of the XSRF-Token issued from your Laravel backend. The default one is also the Laravel default name. |
| `storeModuleName`     | `String`   | `false`  | `sanctum`             | The registered `Vuex` module name. Works only if a `store` instance is passed. |
| `routes`              | `Object`   | `false`  |                       | Routes defined in object props. They will be called from the `axios` instance. |
| `routes.csrf`         | `String`   | `false`  | `sanctum/csrf-cookie` | The route to fetch the XSRF-Cookie from your Laravel backend. |
| `routes.login`        | `String`   | `false`  | `login`               | The route to sends a post request to login. |
| `routes.logout`       | `String`   | `false`  | `logout`              | The route to sends a post request to logout. |
| `routes.me`           | `String`   | `false`  | `me`                  | The route to sends a get request to get the current authenticated user. |

---
## ⚙️ VueSanctum API
Native methods and properties are directly accessible through `this.$sanctum`
#### Properties
| Name       | Type       | Default          | Description |
| ---------- | ---------- | ---------------- | ----------- |
| `eventBus` | `Function` | `null`           | A new Vue instance to emit and listen to events. |
| `options`  | `Object`   | Default options  | The final option structure. |

#### Methods
| Name                 | Params                               | Return    |  Description |
| -------------------- | ------------------------------------ |---------- |  ----------- |
| `fetchCSRFToken()`   |                                      | `Promise` | Sends a get request to the `csrf route`. |
| `login(credentials)` | `{email: string, password: string }` | `Promise` | Fetch the XSRF Token and sends a post request to the `login route`. |
| `logout()`           |                                      | `Promise` | Sends a post request to the `logout route` and finally delete the XSRF Cookie. |
| `me()`               |                                      | `Promise` | Sends a get request to the `me route`. |
| `hasXSRFToken()`     |                                      | `Boolean` | Checks if the XSRF Cookie is set. |

### Vuex API
The Vuex module is namespaced to the `storeModuleName` option.
#### State
| Name              | Type      | Default | Description |
| ----------------- | --------- | ------- | ----------- |
| `user`            | `Object`  | `{}`    | The authenticated user. |
| `isAuthenticated` | `Boolean` | `false` | Is set to true if the user is the first time set. |
| `hasXSRFToken`    | `Boolean` | `false` | Is set to true if XSRF Cookie exists or is fetched. |

#### Mutations
| Name                       | Params        |  Description |
| -------------------------- | --------------|  ----------- |
| `setUser`                  | `User Object` | Sets the `user` state. Is called in the `fetchUser` action. If user is set the first time, the `sanctum:userInitialized` Event is fired. |
| `updateAuthenticatedState` | `Boolean`     | Sets the `isAuthenticated` state. If the state changes to true, the `sanctum:authenticated` Event is fired. |
| `updateXSRFTokenState`     | `Boolean`     | Sets the `hasXSRFToken` state. |
| `clear`                    |               | Clears the `user` state and emits the `sanctum:loggedOut` Event. Is also invoked from the `clear` action. |

#### Actions
| Name           | Params                               |  Description |
| ---------------| ------------------------------------ |  ----------- |
| `login`        | `{email: string, password: string }` | Invokes the `$sanctum.login()` method, commits the `updateXSRFTokenState` mutation and dispatch the `fetchUser` action if the `fetchUserAfterLogin` option is enabled. |
| `fetchUser`    |                                      | Invokes the `$sanctum.me()` method, commits the `setUser` and the `updateAuthenticatedState` mutation. |
| `logout`       |                                      | Invokes the `$sanctum.logout()` method. Finally dispatches the `clear` action. |
| `tryAutoLogin` |                                      | Checks the `hasXSRFToken` state, if is set to false, it reject the action. Otherwise it will try to dispatch the `fetchUser` action. |
| `clear`        |                                      | Sets the `updateXSRFTokenState` and `updateAuthenticatedState` state to false and commits the `clear` mutation.  |

#### Getters
| Name              | Description |
| ------------------| ----------- |
| `getUser`         | Returns the `user` state. |
| `isAuthenticated` | Returns the `isAuthenticated` state. |
| `hasXSRFToken`    | Returns the `hasXSRFToken` state. |
---
## 🎉 VueSanctum Events
Events are only emitted from the `Vuex` store.
| Event name                | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `sanctum:authenticated`   | Fires if the authenticated state changes to true.      |
| `sanctum:userInitialized` |  Fires if the user is the first time set in the store. |
| `sanctum:loggedOut`       |  Fires after the user is logged out                    |
