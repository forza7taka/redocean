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
import HistoryStatePlugin from 'vue-history-state'
import './registerServiceWorker'
// import qs from 'qs'
import urlJoin from 'url-join'
loadFonts()

createApp(App)
  .use(router)
  .use(vueAxios, axios)
  .use(vuetify)
  .use(VueGtag, { property: { id: process.env.VUE_APP_GA_TRACKING_ID, router } })
  .use(store)
  .use(toaster)
  .use(HistoryStatePlugin, {/* optional options */ })
  .component("infinite-loading", infiniteLoading)
  .mount('#app')

axios.interceptors.request.use(
  (config) => {
    const url1 = config.url
    if (url1 != 'https://translation.googleapis.com/language/translate/v2') {
      const accessJwt = store.getters.getAccessJwt
      if (accessJwt) {
        config.headers.Authorization = `Bearer ${accessJwt}`
      }
    }

    const url2 = config.url
    const refreshUrl = urlJoin(store.getters.getServer, 'xrpc', 'com.atproto.server.refreshSession')
    if (url2 == refreshUrl) {
      const refreshJwt = store.getters.getRefreshJwt
      if (refreshJwt) {
        config.headers.Authorization = `Bearer ${refreshJwt}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
