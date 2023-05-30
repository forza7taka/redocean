<template>
  <div class="displayArea mx-auto">
    <FeedView :feeds="timeline.array" @deletePost="deletePost"></FeedView>
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
import FeedView from "./FeedView.vue"
import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useHistoryState, onBackupState } from 'vue-history-state';
import Timeline from '@/common/timeline.js'
import { useCatchError } from '@/common/catchError';
import axios from "axios";
import { useRequestGet } from "@/common/requestGet";

const completed = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = ref(new Timeline())
const store = useStore()
const loading = ref(null)
const loadingCount = ref(0)
const requestGet = useRequestGet(store)

const deletePost = async (uri) => {
  timeline.value.delete(uri)
}
onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    timeline.value = new Timeline()
    await getTimeline()
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    await getTimeline()
    timeline.value.setArray(Object.values(historyState.data))
    return
  }
  await getTimeline()
});

onBackupState(() => (timeline.value.array));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getTimeline(cursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const getTimeline = async (cur) => {
  let params = {}
  if (!cur) {
    params = {
      feed: "at://did:web:animals.bskyfeed.forza7.org",
      limit: 20
    }
  } else {
    params = {
      feed: "at://did:web:animals.bskyfeed.forza7.org",
      limit: 20,
      cursor: cur.value
    }
  }

  try {
    let uri = "https://animals.bskyfeed.forza7.org/xrpc/app.bsky.feed.getFeedSkeleton?"
    uri = uri + "feed=" + encodeURIComponent(params.feed) + "&"
    uri = uri + "limit=20&"
    if (params.cursor) {
      uri = uri + "cursor=" + encodeURIComponent(params.cursor)
    }
    const response = await axios.get(uri)
    if (response.data.feed.length == 0) {
      completed.value = true
      return
    }
    await getPosts(response.data.feed)
    cursor.value = response.data.cursor
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const getPosts = async (feeds) => {
  let uris = []
  feeds.forEach(el => {
    uris.push(el.post)
  })
  const response = await requestGet.get("app.bsky.feed.getPosts", { uris: uris })
  response.res.posts.forEach(el => {
    timeline.value.add({ post: el })
  })
}

</script>