<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Popular"></v-toolbar>
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
import { useRequestGet } from '../common/requestGet.js'
import Timeline from '../common/timeline.js'
import { useCatchError } from '@/common/catchError';

const completed = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = ref(new Timeline())
const store = useStore()
const loading = ref(null)
const loadingCount = ref(0)

const deletePost = async (uri) => {
  timeline.value.delete(uri)
}

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
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getPopular(cursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)
const getPopular = async (cur) => {
  let params = {}
  if (!cur) {
    params = { limit: 25 }
  } else {
    params = { limit: 25, cursor: cur.value }
  }
  try {
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.unspecced.getPopular", params)
    timeline.value.setArray(response.res.feed)
    cursor.value = response.res.cursor
    if (response.res.feed.length == 0) {
      completed.value = true
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
</script>
