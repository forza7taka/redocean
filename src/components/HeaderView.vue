<template>
  <div>
    <v-app-bar fixed :color="color">
      <template v-if="settings.handed">
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
        <v-app-bar-title class="text-subtitle-2">redocean ~always β~</v-app-bar-title>
        <v-btn to="/settings" icon>
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
        <v-btn to="/sync" icon>
          <v-icon>mdi-link-variant-plus</v-icon>
        </v-btn>
        <template v-if="unReadCount != 0">
          <v-badge offset-x="10" offset-y="10" overlap color="blue">
            <template #badge>
              <span>{{ unReadCount }}</span>
            </template>
            <v-btn v-if="store.getters.getAccessJwt" to="/notification" icon>
              <v-icon size="18" color="white">mdi-bell</v-icon>
            </v-btn>
          </v-badge>
        </template>
        <template v-if="unReadCount == 0">
          <v-btn v-if="store.getters.getAccessJwt" to="/notification" icon>
            <v-icon size="18">mdi-bell</v-icon>
          </v-btn>
        </template>
      </template>
      <template v-else>
        <template v-if="unReadCount == 0">
          <v-btn v-if="store.getters.getAccessJwt" to="/notification" icon>
            <v-icon size="18">mdi-bell</v-icon>
          </v-btn>
        </template>
        <template v-if="unReadCount != 0">
          <v-badge offset-x="10" offset-y="10" overlap color="blue">
            <template #badge>
              <span>{{ unReadCount }}</span>
            </template>
            <v-btn v-if="store.getters.getAccessJwt" to="/notification" icon>
              <v-icon size="18" color="white">mdi-bell</v-icon>
            </v-btn>
          </v-badge>
        </template>

        <v-btn to="/sync" icon>
          <v-icon>mdi-link-variant-plus</v-icon>
        </v-btn>
        <v-btn to="/settings" icon>
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
        <v-app-bar-title class="text-subtitle-2">redocean ~always β~</v-app-bar-title>
        <v-app-bar-nav-icon @click="drawer = true" right></v-app-bar-nav-icon>
      </template>
    </v-app-bar>
    <template v-if="settings.handed && drawer">
      <v-navigation-drawer v-model="drawer" fixed temporary>
        <!-- <template v-if="store.getters.getProfile">
          <v-avatar color="surface-variant">
            <v-img cover v-bind:src=store.getters.getProfile.avatar alt="avatar"></v-img>
          </v-avatar>
        </template> -->
        <v-list nav dense>
          <template v-for="(menuItem, index) in menuItems" :key="index">
            <v-list-item v-if="store.getters.getAccessJwt || !menuItem.login"
              active-class="deep-purple--text text--accent-4">
              <div>
                <router-link :to="menuItem.link" class="link">
                  <v-icon>{{ menuItem.icon }}</v-icon>
                  {{ menuItem.name }}
                </router-link>
              </div>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>
    </template>
    <template v-else-if="!settings.handed && drawer">
      <v-navigation-drawer v-model="drawer" fixed temporary class="drawer-right">
        <v-list nav dense>
          <template v-for="(menuItem, index) in menuItems" :key="index">
            <v-list-item v-if="store.getters.getAccessJwt || !menuItem.login"
              active-class="deep-purple--text text--accent-4">
              <div>
                <router-link :to="menuItem.link" class="link">
                  <v-icon>{{ menuItem.icon }}</v-icon>
                  {{ menuItem.name }}
                </router-link>
              </div>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>
    </template>
  </div>
</template>
<style>
.drawer-right {
  right: 0 !important;
  left: auto !important;
}
</style>
<script setup>
import { ref, watch, onMounted, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '@/common/requestGet'
import { useRequestPost } from '@/common/requestPost'
import { createToaster } from '@meforma/vue-toaster'
import { useStorage } from '@vueuse/core'
import push from 'push.js'
import { Setting } from '@/common/setting'
import { useSettings } from '@/common/settings'

const settings = ref(new Setting())
useStorage('redocean', settings)

const completed = ref(false)
const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const drawer = ref(false)
const unReadCount = ref(0)
const color = ref("pink-lighten-2")
const followsCursor = ref(null)
const likesCursor = ref(null)
const repostsCursor = ref(null)
const completedFollows = ref(false)
const completedReposts = ref(false)
const completedLikes = ref(false)
const pushedNotifications = ref(new Map())
const userSettings = ref(null)
const settingsManager = useSettings(settings.value)
const menuItems = ref([
  {
    icon: "mdi-login",
    name: "Login",
    link: "/",
    login: false
  },
  {
    icon: "mdi-home",
    name: "Home",
    link: "/home",
    login: true
  },
  {
    icon: "mdi-view-list",
    name: "Timeline",
    link: "/timeline",
    login: true
  },
  {
    icon: "mdi-playlist-check",
    name: "CustomFeed",
    link: "/customFeed",
    login: true
  },
  {
    icon: "mdi-face-profile",
    name: "Profile",
    link: "/profile",
    login: true
  },
  {
    icon: "mdi-star",
    name: "Suggestions",
    link: "/suggestions",
    login: true
  },
  {
    icon: "mdi-link-variant-plus",
    name: "Sync",
    link: "/sync",
    login: false
  },
  {
    icon: "mdi-semantic-web",
    name: "Description",
    link: "/dsescription",
    login: false
  },

  {
    icon: "mdi-shield-account",
    name: "PrivacyPolicy",
    link: "/privacypolicy",
    login: false
  },
])

watch(() => store.getters.getColor, () => {
  color.value = store.getters.getColor || 'red-lighten-1'
})

onBeforeMount(async () => {
  color.value = store.getters.getColor || 'red-lighten-1'
  userSettings.value = await settingsManager.getUser(store.getters.getDid, store.getters.getHandle)
})

onMounted(async () => {
  setInterval(async () => {
    await getUnreadCount()
    if (unReadCount.value != 0) {
      notificate()
    }
  }, 30000)

  setInterval(async () => {
    if (!store.getters.getDid) {
      return
    }
    const response = await requestPost.post("com.atproto.server.refreshSession")
    store.dispatch('doCreateSession', response.res);
  }, 30000)

  setInterval(async () => {
    try {
      if (!(store.getters.getDid) && !(store.getters.getAccessJwt)) {
        return
      }
      if (!completedFollows.value) {
        await getFollows(followsCursor)
      }
      if (!completedLikes.value) {
        await getLikes(likesCursor)
      }
      if (!completedReposts.value) {
        await getReposts(repostsCursor)
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

const notificate = async () => {
  const response = await requestGet.get("app.bsky.notification.listNotifications", {})
  for (let i = 0; i < response.res.notifications.length; i++) {
    const n = response.res.notifications[i]
    if (n.isRead) {
      continue
    }
    if (pushedNotifications.value.get(n.cid)) {
      continue
    }
    let message = ""
    if (n.reason == "follow") {
      if (!userSettings.value.push || !userSettings.value.push.enableFollowed) {
        continue
      }
      message = "followed"
    }
    if (n.reason == "repost") {
      if (!userSettings.value.push || !userSettings.value.push.enableReposted) {
        continue
      }
      message = "reposted"
    }
    if (n.reason == "reply") {
      if (!userSettings.value.push || !userSettings.value.push.enableReplied) {
        continue
      }
      message = "replied"
    }
    if (n.reason == "like") {
      if (!userSettings.value.push || !userSettings.value.push.enableLiked) {
        continue
      }
      message = "liked"
    }
    if (n.reason == "mention") {
      if (!userSettings.value.push || !userSettings.value.push.enableMention) {
        continue
      }
      message = "mention"
    }
    message = message + " by " + n.author.handle
    pushedNotifications.value.set(n.cid, n.cid)
    push.create(n.reason, {
      body: message,
      icon: "/favicon.ico",
      timeout: 5000,
      onClick: function () {
        window.focus();
        this.close();
      }
    })
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
    likesCursor.value = response.res.cursor
    if (response.res.records.length == 0) {
      completedLikes.value = true
      return
    }
    store.dispatch('doAddLikes', response.res)
  } catch (e) {
    completed.value = true
    throw e
  }
}

const getReposts = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {
      repo: store.getters.getDid,
      collection: "app.bsky.feed.repost",
      limit: 100
    }
  } else {
    params = {
      repo: store.getters.getDid,
      collection: "app.bsky.feed.repost",
      cursor: cursor.value,
    }
  }
  let response = null
  try {
    response = await requestGet.get("com.atproto.repo.listRecords", params)
  } catch (e) {
    if (!(e.response && e.response.status === 400)) {
      completedReposts.value = true
      throw e
    }
  }
  repostsCursor.value = response.res.cursor
  if (response.res.records.length == 0) {
    completedReposts.value = true
    return
  }
  store.dispatch('doAddReposts', response.res)
}


const getFollows = async (cursor) => {
  let params = {}
  if (!cursor.value) {
    params = { actor: store.getters.getHandle, limit: 100 }
  } else {
    params = { actor: store.getters.getHandle, cursor: cursor.value, limit: 100 }
  }
  let response = null
  try {
    response = await requestGet.get("app.bsky.graph.getFollows", params)
  } catch (e) {
    completedFollows.value = true
    throw e
  }
  followsCursor.value = response.res.cursor
  if (response.res.follows.length == 0) {
    completedFollows.value = true
    return
  }
  store.dispatch('doAddFollows', response.res)
}

watch(
  () => store.getters.getDid,
  async () => {
    userSettings.value = await settingsManager.getUser(store.getters.getDid, store.getters.getHandle)
    followsCursor.value = null
    completedFollows.value = false
    likesCursor.value = null
    completedLikes.value = false
    repostsCursor.value = null
    completedReposts.value = false
    store.dispatch('doRemoveAllReposts')
    store.dispatch('doRemoveAllLikes')
  }
)
</script>
