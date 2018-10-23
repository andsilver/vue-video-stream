// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocketio from 'vue-socket.io'
import VueClipboard from 'vue-clipboard2'
import Notifications from 'vue-notification'
import VueLocalStorage from 'vue-localstorage'
import VueStripeCheckout from 'vue-stripe-checkout'

import BootstrapVue from 'bootstrap-vue'
import { Dropdown } from 'bootstrap-vue/es/components'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import appFilters from './deps'
import router from './router'
import appRun from './appRun'

Vue.use(VueAxios, axios)
Vue.use(VueClipboard)
Vue.use(Notifications)
Vue.use(BootstrapVue)
Vue.use(VueSocketio, 'https://www.haxr.io:1330/')
Vue.use(VueLocalStorage, { name: 'localStorage', bind: true })
const options = {
  // old keys
  // key: 'pk_test_uhBxuU6g7MNxplqBzf6ofRpz',
  // key: 'pk_live_yIPV9HjJOfT5DiSifUT5ZKIi',

  // newkeys
  key: 'pk_test_3CqyR5dPd6by5H8IQNT6r8Uq',
  // key: 'pk_live_......',

  image: 'https://castr.io/streamtomultiplesites.png',
  locale: 'auto',
  // currency: 'PHP',
  // billingAddress: true,
  panelLabel: 'Subscribe {{amount}}'
}

Vue.use(VueStripeCheckout, options)

appRun()
appFilters(Vue)

Vue.config.productionTip = false

// bootstrap components
Vue.use(Dropdown)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
