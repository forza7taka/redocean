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
// import setting from '@/common/settings'

const store = useStore()
const route = useRoute()
const gtag = useGtag()
const visiblePost = ref(false)
const color = ref(null)

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

  const user = await Parse.User.current();
  if (user) {
    // connect
    await downloadSetting(user.id)
    await downloadLogins(user.id)
    await downloadUserSettings(user.id)
  }
})

const downloadSetting = async (id) => {
  const Setting = Parse.Object.extend("setting");
  const query = new Parse.Query(Setting);
  query.equalTo("userID", id);
  const object = await query.first();
  console.log(object.get("userID"))
  console.log(object.get("translationApiKey"))
  console.log(object.get("translationLang"))
  console.log(object.get("handed"))
}

const downloadLogins = async (id) => {
  const Logins = Parse.Object.extend("logins");
  const query = new Parse.Query(Logins);
  query.equalTo("userID", id);
  const results = await query.find();
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    console.log(object.get("userID"))
    console.log(object.get("server"))
    console.log(object.get("handle"))
    //    console.log(object.get("password"))
    console.log(object.get("did"))
    console.log(object.get("avatar"))
  }
}

const downloadUserSettings = async (id) => {
  const Setting = Parse.Object.extend("setting");
  const query = new Parse.Query(Setting);
  query.equalTo("userID", id);
  const results = await query.find();
  for (let i = 0; i < results.length; i++) {
    const object = results[i];
    console.log(object.get("userID"))
    console.log(object.get("did"))
    console.log(object.get("value"))
  }
}

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
</style>
