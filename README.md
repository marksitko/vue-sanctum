# vue-sanctum
A small Vue wrapper for the [Laravel Sanctum](https://laravel.com/docs/8.x/sanctum) Authentication flow. 

**Package is currently in development and in an early prototyping state.**

## Install
Clone or download this repo
```sh 
cd vue-sanctum
```
```sh 
npm install
``` 
```sh 
npm run build
```
Now link your locale package
```sh 
npm link
```

# Setup
Go into your vue project and install the linked package
 ```shell
npm link vue-sanctum 
 ```

Install the plugin. 
Vue-Sanctum requires an axios instance.
```javascript
import VueSanctum from 'vue-sanctum';
Vue.use(VueSanctum, {
    axios: axios
});
```

Other options are optional: 
| prop | options (default) | type |description |
| -----| ----------------- | -----|----------- |
| routes.csrf | sanctum/csrf-cookie | String | Route to fetch the CSRF-Cookie from your Laravel backend |
| routes.login | login | String | Login Endpoint |
| routes.logout | logout | String | Logout Endpoint |
| xsrfCookieName | XSRF-TOKEN | String | Name of the CSRF-Cookie |

## Usage
The Plugin adds `$sanctum` to the Vue prototype, therefore you call call `this.$sanctum` methods from anywhere in your Vue Application.

#### Login
To Login you only need to call the vue-sanctum login Method. It will first call for the CSRF-Cookie and then send a post request to your login route. 
```javascript
this.$sanctum.login(CREDENTIALS)
    .then(data => {
        // now you are logged in
    })
    .catch(error => {
        // catch some error
    });
```

#### Logout
It call your logout route and finally delete the CSRF-Cookie
```javascript
this.$sanctum.logout()
    .then(data => {
        // now you are logged out
    })
    .catch(error => {
        // catch some error
    });
```

#### Get CSRF-Cookie only
```javascript
this.$sanctum.fetchCsrfCookie()
    .then(data => {
        // now the csrf cookie is stored
    })
    .catch(error => {
        // catch some error
    });
```
