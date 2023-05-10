<template>
  <div class="displayArea mx-auto">
    <FeedView :feeds="timeline.array"></FeedView>
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
import FeedView from "./FeedView.vue"
import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import Timeline from '../common/timeline.js'

const complated = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = ref(new Timeline())
const store = useStore()
const loading = ref(null)
const loadingCount = ref(0)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    timeline.value = new Timeline()
    await getPopular()
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    timeline.value.setArray(Object.values(historyState.data))
    return
  }
  await getPopular()
});

onBackupState(() => (timeline.value.array));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value && loadingCount.value != 0) {
      await getPopular(cursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)
const getPopular = async (cur) => {
  let params = {}
  if (!cur) {
    params = {}
  } else {
    params = { cursor: cur.value }
  }
  try {
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.unspecced.getPopular", params)
    timeline.value.setArray(response.res.feed)
    cursor.value = response.res.cursor
    if (response.res.feed.length == 0) {
      complated.value = true
    }
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}
</script>
