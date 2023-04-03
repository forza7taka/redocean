import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import axios from 'axios'
import vueAxios from 'vue-axios'
import store from './store'
import createGtag from 'vue-gtag-next';

loadFonts()

createApp(App)
  .use(router)
  .use(vueAxios, axios)
  .use(vuetify)
  .use(createGtag, {config: {id: process.env.GA_TRACKING_ID}}, router)
  .use(store)
  .mount('#app')
  
  