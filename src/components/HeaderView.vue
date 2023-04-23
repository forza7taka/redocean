<template>
<div>
  <v-app-bar fixed color="pink-lighten-2 lighten-5">
    <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
    <v-toolbar-title>redocean</v-toolbar-title>
    <v-spacer></v-spacer>
    <div v-if="unReadCount != 0">
      <v-badge right top overlap color="blue">
        <template #badge>
          <span>{{ unReadCount }}</span>
        </template>
        <v-btn to="/notification" icon>
          <v-icon size="18" color="white">mdi-bell</v-icon>
        </v-btn>
      </v-badge>
    </div>
    <div v-if="unReadCount == 0">
      <v-btn to="/notification" icon>
      <v-icon size="18">mdi-bell</v-icon>
    </v-btn>    
  </div>
    <v-btn v-if="store.getters.getAccessJwt" @click="postDialog = true"><v-icon>mdi-plus</v-icon></v-btn>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-list nav dense>
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.name"
          :prepend-icon="menuItem.icon"
          
          active-class="deep-purple--text text--accent-4">
          <router-link :to= menuItem.link>   
            {{menuItem.name}}
          </router-link>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>

  <div v-if="postDialog == true">
      <PostFormView v-model="postDialog" @onPostDialogClose="onPostDialogClose" mode="Post"></PostFormView>    
  </div>
  <div v-if="searchDialog == true">
      <SearchView
       v-model="searchDialog" @onSearchDialogClose="onSearchDialogClose" mode="Post"></SearchView>    
  </div>
</template>

<script setup>
import PostFormView from "./PostFormView.vue"
import SearchView from "./SearchView.vue"
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster'
const completed = ref(false)
const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet()
const drawer = ref(false) 
const postDialog = ref( false)
const searchDialog = ref( false)
const unReadCount = ref( 0)
const cursor = ref(null)
const menuItems = ref([
        {
          icon: "mdi-account-plus",
          name: "Account",
          link: "/accountCreate",
        },
        {
          icon: "mdi-home",
          name: "Home",
          link: "/",
        },
        {
         icon: "mdi-view-list",
          name: "Timeline",
          link: "/timeline",
        },
        {
          icon: "mdi-face-profile",
          name: "Profile",
          link: "/profile"
        },
        {
          icon: "mdi-fire",
          name: "Popular",
          link: "/popular"
        },
        {
          icon: "mdi-star",
          name: "Suggestions",
          link: "/suggestions"
        },
        {
          icon: "mdi-shield-account",
          name: "PrivacyPolicy",
          link: "/privacypolicy"
        },
])
        
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

const onPostDialogClose = async (payload) => {
  postDialog.value = payload;
}
const onSearchDialogClose = async (value) => {
  searchDialog.value = value;
}
</script>
