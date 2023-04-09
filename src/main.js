import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import axios from 'axios'
import vueAxios from 'vue-axios'
import store from './store'
import VueGtag from 'vue-gtag-next';
import infiniteLoading from "v3-infinite-loading";
import toaster from '@meforma/vue-toaster';

loadFonts()

createApp(App)
  .use(router)
  .use(vueAxios, axios)
  .use(vuetify)
  .use(VueGtag, { property: { id: process.env.VUE_APP_GA_TRACKING_ID, router }})
  .use(store)
  .use(toaster)
  .component("infinite-loading", infiniteLoading)
  .mount('#app')
  
  