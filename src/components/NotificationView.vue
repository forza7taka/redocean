<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        Notifications
      </v-card-title>
    </v-card>
    <v-list v-if="notifications">
      <v-list-item v-for="(n, nIndex) in notifications" :key="nIndex">
        <v-card v-if="!store.getters.getMutes.includes(n.author.did)" width="400px" class="mx-auto mt-5">
          <v-card-text>
            <v-icon v-if="!n.isRead" color="red">mdi-circle</v-icon>
            <v-icon v-if="n.reason == 'follow'">mdi-account-check</v-icon>
            <v-icon v-if="n.reason == 'repost'">mdi-repeat</v-icon>
            <v-icon v-if="n.reason == 'reply'">mdi-comment-outline</v-icon>
            <v-icon v-if="n.reason == 'like'" color="red">mdi-heart-outline</v-icon>
            by @{{ n.author.handle }}
            <router-link :to="`/profile/${n.author.handle}`">
              <v-avatar size=20 color="surface-variant" small>
                <v-img cover v-bind:src=n.author.avatar alt="avatar"></v-img>
              </v-avatar>
            </router-link>
            {{ n.author.displayName }}
          </v-card-text>
          <v-card v-if="posts.get(n.reasonSubject)">
            <v-card-subtitle>{{ posts.get(n.reasonSubject).value.createdAt }}</v-card-subtitle>
            <v-card-text class="text-pre-wrap">
              {{ posts.get(n.reasonSubject).value.text }}
            </v-card-text>
          </v-card>
        </v-card>
      </v-list-item>
    </v-list>

    <div ref="load">
      <v-container class="my-5">
        <v-row justify="center">
          <v-progress-circular model-value="20"></v-progress-circular>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>

import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'

const complated = ref(false)
const fetchedNotifications = ref(new Array())
const cursor = ref(null)
const historyState = useHistoryState();
const notifications = ref(historyState.data || fetchedNotifications)
const load = ref(null)
const posts = ref(new Map())
const toast = createToaster()
const requestGet = useRequestGet()
const requestPost = useRequestPost()
const store = useStore()

onBeforeMount(async () => {
  await getNotifications()
  await getPosts(notifications)
  await updateSeen()
  if (historyState.action === 'reload') {
    notifications.value = fetchedNotifications.value
    return
  }
});

onBackupState(() => notifications);

useIntersectionObserver(
  load,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getNotifications(cursor)
    }
  }
)

const updateSeen = async () => {
  try {
    await requestPost.post("app.bsky.notification.updateSeen", { seenAt: new Date })
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getNotifications = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.notification.listNotifications", params)
    cursor = response.res.cursor
    if (response.res.notifications.length == 0) {
      complated.value = true
    }
    fetchedNotifications.value = fetchedNotifications.value.concat(response.res.notifications)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getPosts = async (notifications) => {
  try {
    for (const n of notifications.value) {
      if (n.reason == "follow") {
        continue
      }
      if (n.reasonSubject in posts.value) {
        continue
      }
      let params = {
        repo: store.getters.getHandle,
        collection: "app.bsky.feed.post",
        rkey: String(n.reasonSubject).substr(-13)
      }
      try {
        const response = await requestGet.get("com.atproto.repo.getRecord", params)
        posts.value.set(n.reasonSubject, response.res)
      } catch (e) {
        if (e.response && e.response.status === 400) {
          continue
        }
        throw e
      }
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>