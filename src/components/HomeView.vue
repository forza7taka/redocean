<template>
  <div class="displayArea mx-auto">
    <template v-if="feeds">
      <v-tabs v-model="tab">
        <div v-for="(f, index) in pinnedFeeds" :key="index" :value=index>
          <v-tab :value=index @click="getTimeline(f)">
            <template v-if="!f">
              TimeLine
            </template>
            <template v-else>
              {{ displayNameMap.get(f) }}
            </template>
          </v-tab>
        </div>
      </v-tabs>
    </template>
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
import { ref, onBeforeMount, watch } from 'vue'
import { useHistoryState, onBackupState } from 'vue-history-state';

import { useStore } from 'vuex'
import Timeline from '@/common/timeline.js'
import { useCatchError } from '@/common/catchError';
import { useRequestGet } from "@/common/requestGet";

const completed = ref(false)
const cursor = ref(null)
const timeline = ref(new Timeline())
const store = useStore()
const loading = ref(null)
const loadingCount = ref(0)
const feeds = ref([])
const requestGet = useRequestGet(store)

const tab = ref(0)

const displayNameMap = ref(new Map())

const historyState = useHistoryState();

const pinnedFeeds = ref(new Array())

const deletePost = async (uri) => {
  timeline.value.delete(uri)
}

onBeforeMount(async () => {

  const res = await requestGet.get("app.bsky.actor.getPreferences")
  for (let i = 0; i < res.res.preferences.length; i++) {
    const preference = res.res.preferences[i]
    if (preference.$type == "app.bsky.actor.defs#savedFeedsPref") {
      pinnedFeeds.value = preference.pinned
      pinnedFeeds.value.unshift(null)
      break
    }
  }

  await getFeedGenerators()

  if (historyState.action === 'reload') {
    tab.value = await getIndex(historyState.data.uri)
    timeline.value = new Timeline()
    const uri = historyState.data.uri
    await getTimeline(uri)
    return
  }

  if (historyState.action === 'back' || historyState.action === 'forward') {
    if (historyState.action === 'back' && (historyState.getItems()[historyState.page + 1].item[1].name == 'post')) {
      const uri = historyState.data.uri
      tab.value = await getIndex(uri)
      await getTimeline(uri)
    }
    for (let i = 0; i < pinnedFeeds.value.length; i++) {
      if (historyState.data == pinnedFeeds.value[i])  {
        break;
      }
    }
    const uri = historyState.data.uri
    tab.value = await getIndex(uri)
    await timeline.value.setArray(Object.values(historyState.data.timeline))
    window.moveTo(0, await historyState.getItems()[historyState.page].item[3].window.top) 
    return
  }
  tab.value = 0
  await getTimeline(null)  
});

onBackupState(() => ({
  timeline: timeline.value.array,
  uri: pinnedFeeds.value[tab.value],
}));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      const uri = await getUri(tab.value)
      await getTimeline(uri, cursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const getUri = async (index) => {
  if (!pinnedFeeds.value) {
    return null
  }
  if (pinnedFeeds.value.length == 0) {
    return null
  }
  return pinnedFeeds.value[index]
}

const getIndex = async (uri) => {
  if (!pinnedFeeds.value) {
    return 0
  }
  if (pinnedFeeds.value.length == 0) {
    return 0
  }
  for (let i = 0; i < pinnedFeeds.value.length; i++) {
    if (uri == pinnedFeeds.value[i]) {
      return i
    }
  }
  return 0
}

const getFeedGenerators = async () => {
  try {
    if (!pinnedFeeds.value) {
      return
    }
    if (pinnedFeeds.value.length == 1) {
      return
    }
    const params = { feeds: pinnedFeeds.value }
    const response = await requestGet.get("app.bsky.feed.getFeedGenerators", params)

    feeds.value = response.res.feeds
    for (let i = 0; i < response.res.feeds.length; i++) {
      displayNameMap.value.set(response.res.feeds[i].uri, response.res.feeds[i].displayName)
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const getTimeline = async (uri, cur) => {
  let params = {}
  try {
    let response
    if (uri == null) {
      if (!cur) {
        params = {  limit: 25 }
      } else {
        params = {  limit: 25, cursor: cur.value }
      }
      response = await requestGet.get("app.bsky.feed.getTimeline", params)
    } else {
      if (!cur) {
        params = { feed: uri, limit: 25 }
      } else {
        params = { feed: uri, limit: 25, cursor: cur.value }
      }
      response = await requestGet.get("app.bsky.feed.getFeed", params)
    }

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

watch(async () =>  tab, () => {
  completed.value = false
  timeline.value = new Timeline()
  cursor.value = null
  loadingCount.value =0
}, { deep: true }
);

</script>