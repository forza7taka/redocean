<template>
<div>
  <v-app-bar  fixed :color="color">    
  <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
  <div v-if="store.getters.getProfile">
    <v-avatar color="surface-variant">
      <v-img cover v-bind:src=store.getters.getProfile.avatar alt="avatar"></v-img>
    </v-avatar>
  </div>
  <v-toolbar-title>redocean</v-toolbar-title>
    <v-spacer></v-spacer>
    <div v-if="unReadCount != 0">
      <v-badge right top overlap color="blue">
        <template #badge>
          <span>{{ unReadCount }}</span>
        </template>
        <v-btn v-if="store.getters.getAccessJwt" to="/notification" icon>
          <v-icon size="18" color="white">mdi-bell</v-icon>
        </v-btn>
      </v-badge>
    </div>
    <div v-if="unReadCount == 0">
      <v-btn v-if="store.getters.getAccessJwt" to="/notification" icon>
      <v-icon size="18">mdi-bell</v-icon>
    </v-btn>    
  </div>
    <v-btn v-if="store.getters.getAccessJwt" to="/post"><v-icon>mdi-plus</v-icon></v-btn>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-list nav dense>
        <v-list-item v-for="(menuItem, index) in menuItems" :key="index"
          active-class="deep-purple--text text--accent-4">    
          <div v-if="store.getters.getAccessJwt || !menuItem.login">
          <router-link :to= menuItem.link>   
            <v-icon>{{menuItem.icon}}</v-icon>{{menuItem.name}}
          </router-link>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeMount} from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster'
const completed = ref(false)
const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet(store)
const drawer = ref(false) 
const unReadCount = ref(0)
const cursor = ref(null)
const color = ref("pink-lighten-2")
const menuItems = ref([
        {
          icon: "mdi-account-plus",
          name: "Account",
          link: "/accountCreate",
          login: false
        },
        {
          icon: "mdi-home",
          name: "Home",
          link: "/",
          login: false
        },
        {
         icon: "mdi-view-list",
          name: "Timeline",
          link: "/timeline",
          login: true
        },
        {
          icon: "mdi-face-profile",
          name: "Profile",
          link: "/profile",
          login: true
        },
        {
          icon: "mdi-fire",
          name: "Popular",
          link: "/popular",
          login: true
        },
        {
          icon: "mdi-star",
          name: "Suggestions",
          link: "/suggestions",
          login: true
        },
        {
          icon: "mdi-cog-outline",
          name: "Settings",
          link: "/settings",
          login: true
        },
        {
          icon: "mdi-shield-account",
          name: "PrivacyPolicy",
          link: "/privacypolicy",
          login: false
        },
])

watch(() => store.getters.getColor, () => {
  color.value = store.getters.getColor || 'pink-lighten-2'
})

onBeforeMount(async () => {
  color.value = store.getters.getColor || 'pink-lighten-2'
})

onMounted(async () => {
  setInterval(async () => {
    await getUnreadCount()
  }, 60000)

  setInterval(async() => {
    try {
      if (!(store.getters.getDid) && !(store.getters.getAccessJwt)) {
        return
      }
      if (!completed.value) {
        await getLikes(cursor)        
      }
    } catch (e) {
      toast.error(e, { position: "top-right" })
      completed.value = true
    }
  }, 1000)
})

const getUnreadCount = async () => {
  try {
    if (!store.getters.getAccessJwt) {
      return
    }
    const response = await requestGet.get("app.bsky.notification.getUnreadCount")
    unReadCount.value = response.res.count
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getLikes = async (cursor) => {
  try {
    let params = {}
    if (!cursor) {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.like",
        limit: 100
      }
    } else {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.like",
        cursor: cursor.value
      }
    }

    const response = await requestGet.get("com.atproto.repo.listRecords", params)
    cursor.value = response.res.cursor
    if (response.res.records.length == 0) {
      completed.value = true
      return
    }
    store.dispatch('doAddLikes', response.res)
  } catch (e) {
    completed.value = true
    throw e
  }
}
</script>
