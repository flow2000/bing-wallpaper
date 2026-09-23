// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router'
import axios from 'axios'
import i18n from './locale'

Vue.prototype.$axios = axios
Vue.use(ElementUI);

document.documentElement.lang = i18n.locale

new Vue({
  el: '#app',
  router,
  i18n,
  components: {App},
  template: '<App/>'
})
