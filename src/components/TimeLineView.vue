<template>
  <div class="displayArea mx-auto">
    <!-- <v-bottom-navigation :elevation="0">
      <v-row justify="center" rowa="auto">
        <v-col cols="auto">

        </v-col>
        <v-col cols="auto">
          <v-switch v-model="isShowRepost" label="Repost"></v-switch>
        </v-col>
        <v-col cols="auto">
          <v-switch v-model="isShowReply" label="Reply"></v-switch>
        </v-col>
      </v-row>
    </v-bottom-navigation> -->
    <FeedView :feeds="timeline.array" :isShowReply="isShowReply" :isShowRepost="isShowRepost" @deletePost="deletePost">
    </FeedView>
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
import { useRequestGet } from '@/common/requestGet.js'
import Timeline from '@/common/timeline.js'
import { useCatchError } from '@/common/catchError';

const completed = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = ref(new Timeline())
const store = useStore()
const loading = ref(null)
const loadingCount = ref(0)
const isShowReply = ref(true)
const isShowRepost = ref(true)
const deletePost = async (uri) => {
  timeline.value.delete(uri)
}

onBeforeMount(async () => {

  setInterval(async () => {
    await loadTimeline()
  }, 10000)


  if (historyState.action === 'reload') {
    timeline.value = new Timeline()
    await getTimeline()
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    if (historyState.action === 'back' && (historyState.getItems()[historyState.page + 1].item[1].name == 'post')) {
      await getTimeline()
    }
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
    params = { limit: 25 }
  } else {
    params = { limit: 25, cursor: cur.value }
  }
  try {
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.feed.getTimeline", params)
    timeline.value.setArray(response.res.feed)
    cursor.value = response.res.cursor
    if (response.res.feed.length == 0) {
      completed.value = true
    }
    console.log(response.res.feed)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const loadTimeline = async () => {
  const params = { limit: 25 }
  try {
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.feed.getTimeline", params)
    timeline.value.setArray(response.res.feed)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}



</script>