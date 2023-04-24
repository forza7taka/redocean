<template>
  <FeedView :timeline="timeline"></FeedView>
  <div ref="load">
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
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import {useStore} from 'vuex'
const complated = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = reactive({ feed: [] })
const load = ref(null)
const store = useStore()
const request = useRequestGet(store)
onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    timeline.value = []
    await getPopular()
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    timeline.value = historyState.data.timeline
    return
  }
  await getPopular()
});

onBackupState(() => timeline);

useIntersectionObserver(
  load,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getPopular(cursor)
    }
  }
)

const getPopular = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const response = await request.get("app.bsky.unspecced.getPopular", params)
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