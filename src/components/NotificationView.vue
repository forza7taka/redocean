<template>
  <div class="displayArea mx-auto">
    <v-card class="mx-auto mt-5" variant="flat">
      <v-card-title>
        Notifications
      </v-card-title>
    </v-card>
    <v-list v-if="notifications">
      <v-list-item v-for="(n, nIndex) in notifications.array" :key="nIndex">
        <v-card v-if="!store.getters.getMutes.includes(n.author.did)" class="mx-auto mt-5" variant="flat">
          <v-card-text>
            <v-icon v-if="!n.isRead" color="red">mdi-circle</v-icon>
            <v-icon v-if="n.reason == 'follow'">mdi-account-check</v-icon>
            <v-icon v-if="n.reason == 'repost'">mdi-repeat</v-icon>
            <v-icon v-if="n.reason == 'reply'">mdi-comment-outline</v-icon>
            <v-icon v-if="n.reason == 'like'" color="red">mdi-heart-outline</v-icon>
            <v-icon v-if="n.reason == 'mention'">mdi-at</v-icon>
            by @{{ n.author.handle }}
            <router-link :to="`/profile/${n.author.handle}`">
              <v-avatar size=20 color="surface-variant" small>
                <v-img cover v-bind:src=n.author.avatar alt="avatar"></v-img>
              </v-avatar>
            </router-link>
            {{ n.author.displayName }}
          </v-card-text>

          <v-card v-if="posts.get(n.reasonSubject)" :to="`/thread/${encodeURIComponent(n.reasonSubject)}`" variant="flat">
            <v-card-subtitle>{{ convertDate(posts.get(n.reasonSubject).value.createdAt) }}</v-card-subtitle>
            <v-card-text>
              {{ posts.get(n.reasonSubject).value.text }}
            </v-card-text>
          </v-card>
          <v-card v-if="posts.get(n.uri)" :to="`/thread/${encodeURIComponent(n.uri)}`" variant="flat">
            <v-card-subtitle>{{ convertDate(posts.get(n.uri).value.createdAt) }}</v-card-subtitle>
            <v-card-text>
              {{ posts.get(n.uri).value.text }}
            </v-card-text>
          </v-card>

        </v-card>
        <v-divider />
      </v-list-item>
    </v-list>

    <div ref="loading">
      <v-container class="my-5">
        <v-row justify="center">
          <v-progress-circular indeterminate v-if="!completed" model-value="20"></v-progress-circular>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>

import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '@/common/requestGet.js'
import { useRequestPost } from '@/common/requestPost.js'
import { useDate } from '@/common/date.js'
import { useCatchError } from '@/common/catchError';

class Notirfications {
  constructor() {
    this.array = new Array()
    this.map = new Map()
  }

  async add(notification) {
    if (this.map.has(notification.uri)) {
      return
    }
    if (this.array.length == 0) {
      this.array.push(notification)
      this.map.set(notification.uri, null)
      return
    }
    for (let i = 0; i < this.array.length; i++) {
      const el = this.array[i]
      if (notification.indexedAt > el.indexedAt) {
        this.array.splice(i, 0, notification)
        this.map.set(notification.uri, null)
        return
      }
    }
    if (!this.map.has(notification.uri)) {
      this.array.push(notification)
      this.map.set(notification.uri, null)
    }
    return
  }

  async setArray(array) {
    array.forEach(el => {
      this.add(el)
    });
  }
}

const { convertDate } = useDate()
const completed = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const notifications = ref(new Notirfications())
const loading = ref(null)
const loadingCount = ref(0)
const posts = ref(new Map())
const store = useStore()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    notifications.value = new Notirfications()
    await getNotifications()
    await getPosts(notifications.value.array)
    await updateSeen()
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    notifications.value.setArray(Object.values(historyState.data.notifications))
    await getPosts(notifications.value.array)
    return
  }
  await getNotifications()
  await getPosts(notifications.value.array)
  await updateSeen()
});

onBackupState(() => ({ notifications: notifications.value.array }));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getNotifications(cursor)
      await getPosts(notifications.value.array)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const updateSeen = async () => {
  try {
    await requestPost.post("app.bsky.notification.updateSeen", { seenAt: new Date })
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const getNotifications = async (cur) => {
  let params = {}
  if (!cur) {
    params = {}
  } else {
    params = { cursor: cur.value }
  }
  try {
    const response = await requestGet.get("app.bsky.notification.listNotifications", params)
    cursor.value = response.res.cursor
    if (response.res.notifications.length == 0) {
      completed.value = true
    }
    notifications.value.setArray(response.res.notifications)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const getPosts = async (notifications) => {
  try {
    for (const n of notifications) {
      if (n.reason == "follow") {
        continue
      }
      let reasonSubject = ""
      let handle = ""
      if (n.reason == "mention") {
        reasonSubject = n.uri
        handle = n.author.handle
      } else {
        if (!n.reasonSubject) {
          continue
        }
        if (n.reasonSubject in posts.value) {
          continue
        }
        reasonSubject = n.reasonSubject
        handle = store.getters.getHandle
      }
      let params = {
        repo: handle,
        collection: "app.bsky.feed.post",
        rkey: String(reasonSubject).substr(-13)
      }
      try {
        const response = await requestGet.get("com.atproto.repo.getRecord", params)
        posts.value.set(reasonSubject, response.res)
      } catch (e) {
        if (e.response && e.response.status === 400) {
          continue
        }
        throw e
      }
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
</script>
<style scoped>
router-link {
  text-decoration: none;
}
</style>