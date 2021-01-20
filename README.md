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
<script>
import { mapGetters, mapActions } from 'vuex';
<template>
    <div>
        <p v-if="isAuthenticated">Hello {{ user.name}}!</p>
        <p v-else>You are not logged in</p>
        <!-- Your login form  -->
    </div>
</template>
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
| Option name       | Type       | Required | Default               | Description |
| ----------------- | ---------- | ---------|-----------------------|-------------|
| `axios`           | `Function` | `true`   | `null`                | The axios instance is used to make request to your backend. |
| `store`           | `Function` | `false`  | `null`                | If the `Vuex store` instance is passed it will automatically activate the `VueSanctum Vuex feature` and register per default a `sanctum` namespaced module. |
| `eventBus`        | `Function` | `false`  | `null`                | If you have defined an own `eventBus` app instance, you can pass it to `VueSanctum`, otherwise it will register an own `sanctumEventBus` to the global `window` object. |
| `xsrfToken`       | `String`   | `false`  | `XSRF-TOKEN`          | The name of the XSRF-Token issued from your Laravel backend. The default one is also the Laravel default name. |
| `storeModuleName` | `String`   | `false`  | `sanctum`             | The registered `Vuex` module name. Works only if a `store` instance is passed. |
| `routes`          | `Object`   | `false`  |                       | Routes defined in object props. They will be called from the `axios` instance. |
| `routes.csrf`     | `String`   | `false`  | `sanctum/csrf-cookie` | Route to fetch the XSRF-Cookie from your Laravel backend. |
| `routes.login`    | `String`   | `false`  | `login`               | Sends a post request to login. |
| `routes.logout`   | `String`   | `false`  | `logout`              | Sends a post request to logout. |
| `routes.me`       | `String`   | `false`  | `me`                  | Sends a get request to get the current authenticated user. |

---
## 🎉 VueSanctum Events
Events are only emitted from the `Vuex` store.
| Event name                | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `sanctum:authenticated`   | Fires if the authenticated state changes to true.      |
| `sanctum:userInitialized` |  Fires if the user is the first time set in the store. |
| `sanctum:loggedOut`       |  Fires after the user is logged out                    |
