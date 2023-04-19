<template>
  <FeedView :timeline="timeline"></FeedView>
  <div ref="endRef"></div>
</template>

<script setup>
import FeedView from "./FeedView.vue"
import { useInfiniteScroll } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'

const complated = ref(false)
const fetchedTimeline = ref({ feed: [] })
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = ref(historyState.data || fetchedTimeline)
const store = useStore()
const loading = ref(false)

onBeforeMount(async () => {
  getTimeline(cursor)
  if (historyState.action === 'reload') {
    timeline.value = fetchedTimeline.value
  }
});

onBackupState(() => timeline);

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
    fetchedTimeline.value.feed = fetchedTimeline.value.feed.concat(response.res.feed)
    cursor = response.res.cursor
    if (response.res.feed.length == 0) {
      complated.value = true
    }
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}

const load = async () => {
  if (loading.value == true) {
    return
  }
  if (complated.value == true) {
    return
  }
  loading.value = true
  await getTimeline(cursor)
  loading.value = false
}
const endRef = useInfiniteScroll(endRef, load)
</script>