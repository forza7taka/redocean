<template>
  <div class="displayArea mx-auto">
    <v-card variant="flat">
      <v-card-text>
        <v-btn :to="`/customFeedList/${store.getters.getDid}/${store.getters.getHandle}`"
          icon><v-icon>mdi-playlist-check</v-icon></v-btn>
      </v-card-text>
    </v-card>
    <template v-if="userSettings && userSettings.feeds">
      <v-tabs v-model="tab">
        <div v-for="(f, index) in userSettings.feeds" :key="index" :value=index>
          <v-tab :value=index @click="getTimeline(f)">
            {{ displayNameMap.get(f) }}
          </v-tab>
        </div>
      </v-tabs>
    </template>
    <FeedView :feeds="timeline.array" @deletePost="deletePost"></FeedView>
    <template v-if="!userSettings || !userSettings.feeds">
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
import { useStorage } from '@vueuse/core'
import { useSettings } from '@/common/settings'
import { Setting } from "@/common/setting"

const settings = ref(new Setting())
useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

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

const deletePost = async (uri) => {
  timeline.value.delete(uri)
}
onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(store.getters.getDid, store.getters.getHandle)
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
  if (!userSettings.value.feeds) {
    return null
  }
  if (userSettings.value.feeds.length == 0) {
    return null
  }
  return userSettings.value.feeds[index]
}

const getFeedGenerators = async () => {
  try {
    if (!userSettings.value.feeds) {
      return
    }
    if (userSettings.value.feeds.length == 0) {
      return
    }
    const params = { feeds: userSettings.value.feeds }
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