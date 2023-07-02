<template>
  <div class="displayArea mx-auto">
    <v-card variant="flat">
      <v-card-text>
        <v-btn to="/customFeedList/"
          icon><v-icon>mdi-playlist-check</v-icon></v-btn>
          &nbsp;
          <v-btn to="/customFeedSort/"
            icon><v-icon>mdi-sort</v-icon></v-btn>
        </v-card-text>
    </v-card>
    <template v-if="feeds">
      <v-tabs v-model="tab">
        <div v-for="(f, index) in savedFeeds" :key="index" :value=index>
          <v-tab :value=index @click="getTimeline(f)">
            {{ displayNameMap.get(f) }}
          </v-tab>
        </div>
      </v-tabs>
    </template>
    <FeedView :feeds="timeline.array" @deletePost="deletePost"></FeedView>
    <template v-if="feeds && feeds.length != 0">
    <div ref="loading">
      <v-container class="my-5">
        <v-row justify="center">
          <v-progress-circular indeterminate v-if="!completed" model-value="20"></v-progress-circular>
        </v-row>
      </v-container>
    </div>
    </template>
  </div>
</template>

<script setup>
import FeedView from "./FeedView.vue"
import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount, watch } from 'vue'
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

const savedFeeds = ref(new Array())

const deletePost = async (uri) => {
  timeline.value.delete(uri)
}
onBeforeMount(async () => {
  await getFeedGenerators()
  const uri = await getUri(tab.value)
  await getTimeline(uri)
});

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      console.log(tab.value)
      const uri = await getUri(tab.value)
      await getTimeline(uri, cursor)
      console.log(uri)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const getUri = async (index) => {
  if (!feeds.value) {
    return null
  }
  if (feeds.value.length == 0) {
    return null
  }
  return feeds.value[index].uri
}

const getFeedGenerators = async () => {
  try {
    const res = await requestGet.get("app.bsky.actor.getPreferences")
    for (let i = 0; i < res.res.preferences.length; i++) {
      const preference = res.res.preferences[i]
      if (preference.$type == "app.bsky.actor.defs#savedFeedsPref") {
        savedFeeds.value = preference.saved
        break
      }
    }
    const params = { feeds: savedFeeds.value }
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
  if (!uri) {
    return
  }
  let params = {}
  if (!cur) {
    params = { feed: uri, limit: 25 }
  } else {
    params = { feed: uri, limit: 25, cursor: cur.value }
  }
  try {
    const response = await requestGet.get("app.bsky.feed.getFeed", params)
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

watch(() => tab, () => {
  completed.value = false
  timeline.value = new Timeline()
  cursor.value = null
}, { deep: true }
);

</script>