<template>
  <FeedView :timeline="timeline"></FeedView>
  <div ref="loading">
    <v-container class="my-5">
      <v-row justify="center">
        <v-progress-circular model-value="20"></v-progress-circular>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import FeedView from "./FeedView.vue"
import { useIntersectionObserver } from '@vueuse/core'
import { ref, reactive, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'

const complated = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = reactive({ feed: []})
const store = useStore()
const loading = ref(null)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    timeline.feed.value = []
    await getTimeline()
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    timeline.value = historyState.data.timeline
    return
  }
  await getTimeline()
});

onBackupState(() => timeline);

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getTimeline(cursor)
    }
  }
)

const getTimeline = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.feed.getTimeline", params)
    timeline.feed = timeline.feed.concat(response.res.feed)
    cursor = response.res.cursor
    if (response.res.feed.length == 0) {
      complated.value = true
    }
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}
</script>