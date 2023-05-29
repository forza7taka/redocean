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

// function paramsSerializer(params) {
//   return qs.stringify(params);
//   //return qs.stringify(params, { format: 'RFC1738' });
// }

axios.interceptors.request.use(
  (config) => {
    const url = config.url
    if (url != 'https://translation.googleapis.com/language/translate/v2') {
      const accessJwt = store.getters.getAccessJwt
      if (accessJwt) {
        config.headers.Authorization = `Bearer ${accessJwt}`
      }
    }
    // if (config.params) {
    //   //config.params = qs.stringify(config.params);
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
