<template>
  <v-app color="red-lighten-4">
    <Header />
    <v-main>
      <router-view />
      <v-btn v-if="store.getters.getAccessJwt && visiblePost" to="/post" class="floating-button" fab dark :color="color"
        icon>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-main>
  </v-app>
</template>

<script setup>
import Header from '@/components/HeaderView.vue'
import { ref, watch, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from "vue-router"
import { useGtag } from 'vue-gtag-next'
import Parse from "parse"
import { useParseSettings } from '@/common/parseSettings'
// import { initializeApp } from "firebase/app";

const store = useStore()
const route = useRoute()
const gtag = useGtag()
const visiblePost = ref(false)
const color = ref(null)
const parseSettings = useParseSettings()

onBeforeMount(async () => {
  gtag.pageview({
    page_title: 'readocean',
    page_location: '/',
  });
  if (route.path === '/') {
    gtag.pageview(window.location.pathname);
  }

  Parse.initialize(process.env.VUE_APP_PARSE_APP_ID, process.env.VUE_APP_PARSE_JAVASCRIPT_KEY);
  Parse.serverURL = process.env.VUE_APP_PARSE_SERVER_URI
  await parseSettings.download()

  // const firebaseConfig = {
  //   apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  //   authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  //   projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  //   storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  //   messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENFER_ID,
  //   appId: process.env.VUE_APP_FIREBASE_APP_ID
  // };
  // initializeApp(firebaseConfig);
})

watch(() => store.getters.getColor, () => {
  color.value = store.getters.getColor || 'pink-lighten-2'
})

onBeforeMount(async () => {
  color.value = store.getters.getColor || 'pink-lighten-2'
})

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/timeline')) {
    visiblePost.value = true
    return
  }
  if (newPath.startsWith('/thread')) {
    visiblePost.value = true
    return
  }
  if (newPath.startsWith('/popular')) {
    visiblePost.value = true
    return
  }
  if (newPath.startsWith('/profile')) {
    if (newPath.startsWith('/profileEdit')) {
      visiblePost.value = false
      return
    }
    visiblePost.value = true
    return
  }
  visiblePost.value = false
})


</script>
<style>
.displayArea {
  margin: 5px;
  min-width: 375px;
  max-width: 600px;
}

.v-toolbar {
  background-color: white
}

.floating-button {
  position: fixed;
  bottom: 20px;
  left: v-bind('store.getters.getHanded ? `auto` : `20px`');
  right: v-bind('store.getters.getHanded ? `20px` : `auto`');
  z-index: 9999;
}

.link {
  color: inherit;
  text-decoration: none;
}
</style>
