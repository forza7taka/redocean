import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import axios from 'axios'
import vueAxios from 'vue-axios'
import store from './store'

loadFonts()

createApp(App)
  .use(router)
  .use(vuetify)
  .use(vueAxios, axios)
  .use(store)
  .mount('#app')

