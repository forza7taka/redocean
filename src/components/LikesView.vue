<template>
  <div>
    <v-card width="380px" class="mx-auto mt-5">
      <v-card-title>
        Likes
      </v-card-title>
    </v-card>
    <v-list-item v-for="(f, fIndex) in timeline.feed" :key="fIndex">
      <v-row>
        <v-col class="d-flex justify-center align-center">
          <PostView v-if="f.reply" :post="f.post" :reason="f.reason" :parent="f.reply.parent" :root="f.reply.root"
            :depth="0"></PostView>
          <PostView v-if="!f.reply" :post="f.post" :reason="f.reason" :depth="0"></PostView>
        </v-col>
      </v-row>
    </v-list-item>
    <div ref="loading">
      <v-container class="my-5">
        <v-row justify="center">
          <v-progress-circular model-value="20"></v-progress-circular>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>
import PostView from "./PostView.vue"
import { ref, reactive, watch, onBeforeMount, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster'
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRoute } from "vue-router"
import { useIntersectionObserver } from '@vueuse/core'

const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet(store)
const route = useRoute()
const historyState = useHistoryState();

const completed = ref(false)
const timeline = reactive({ feed: [] })
const cursor = ref(null)
const likes = ref(new Array())
const handle = ref(null)
const loading = ref(null)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    timeline.feed = []
    likes.value = []
    handle.value = await getHandle()
    await getLikes(handle, cursor)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    handle.value = historyState.data.handle
    likes.value = historyState.data.likes
    timeline.feed = historyState.data.feed
    return
  }
  handle.value = await getHandle()
  await getLikes(handle, cursor)
});

onBackupState(() => ({ feed : timeline.feed, likes : likes, handle : handle }));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value) {
      await getLikes(handle, cursor)
    }
  }
)

const getHandle = async () => {
  if (route.params.handle) {
    return route.params.handle
  }
  return store.getters.getHandle
}

const getLikes = async (handle, cursor) => {
  console.log("getLikes") 
  try {
    let params = {}
    if (!cursor) {
      params = {
        repo: handle.value,
        collection: "app.bsky.feed.like",
        limit: 30
      }
    } else {
      params = {
        repo: handle.value,
        collection: "app.bsky.feed.like",
        cursor: cursor.value
      }
    }
    const response = await requestGet.get("com.atproto.repo.listRecords", params)
    likes.value = likes.value.concat(response.res.records)
    cursor = response.res.cursor
    if (response.res.records.length == 0) {
      completed.value = true
      return
    }
    await getPosts(response.res.records)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getPosts = async (likes) => {
  try {
    for (var i = 0; i < likes.length; i++) {
      try {
        const response = await requestGet.get("app.bsky.feed.getPostThread", {uri: likes[i].value.subject.uri})
        const post = reactive({ post: response.res.thread.post })
        timeline.feed.push(post)
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

const stopRouteWatch = watch(
  () => route.currentRoute,
  async () => {
  handle.value = await getHandle()
  await getLikes(handle.value, cursor)
})

onUnmounted(stopRouteWatch)
</script>