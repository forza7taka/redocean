<template>
  <div class="displayArea mx-auto">
         <v-card class="mx-auto mt-5" variant="flat">
            <v-card-actions>
              <v-list-item class="w-100">
            <template v-slot:prepend>
                  <div style="padding-right: 10px">
                    <router-link :to="`/profile/${f.handle}`">
                      <v-avatar color="surface-variant">
                        <v-img cover v-bind:src=f.avatar alt="avatar"></v-img>
                      </v-avatar>
                    </router-link>
                  </div>
                </template>

                <v-list-item-title>{{ f.displayName }}</v-list-item-title>
                <v-list-item-subtitle>@{{ f.handle }}</v-list-item-subtitle>
                <template v-slot:append>
                  <div class="justify-self-end">
                    <v-btn v-if="store.getters.getFollows.includes(f.did)"
                      @click.prevent="unFollow(store.getters.getDid, f.did)"
                      icon><v-icon>mdi-account-remove</v-icon></v-btn>
                    <v-btn v-if="!store.getters.getFollows.includes(f.did)" @click.prevent="follow(f.did)"
                      icon><v-icon>mdi-account-check</v-icon></v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-card-actions>
          </v-card>
</div>
</template>

<script setup>
import { ref, watch, onBeforeMount, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRoute } from "vue-router"
import { useIntersectionObserver } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';
import Timeline from '@/common/timeline.js'

const store = useStore()
const requestGet = useRequestGet(store)
const route = useRoute()
const historyState = useHistoryState();

const completed = ref(false)
const timeline = ref(new Timeline())
const cursor = ref(null)
const likes = ref(new Array())
const handle = ref(null)
const loading = ref(null)
const loadingCount = ref(0)


onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    timeline.value = new Timeline()
    likes.value = []
    handle.value = await getHandle()
    await getLikes(handle, cursor)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    handle.value = historyState.data.handle
    likes.value = historyState.data.likes
    timeline.value = historyState.data.timeline
    return
  }
  handle.value = await getHandle()
  await getLikes(handle, cursor)
});

onBackupState(() => ({ timeline: timeline, likes: likes, handle: handle }));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getLikes(handle, cursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const getHandle = async () => {
  if (route.params.handle) {
    return route.params.handle
  }
  return store.getters.getHandle
}

const getLikes = async (handle, cursor) => {
  console.log("getLikes")
  try {
    let params = {}
    if (!cursor) {
      params = {
        repo: handle.value,
        collection: "app.bsky.feed.like",
        limit: 20
      }
    } else {
      params = {
        repo: handle.value,
        collection: "app.bsky.feed.like",
        cursor: cursor.value,
        limit: 20
      }
    }
    const response = await requestGet.get("com.atproto.repo.listRecords", params)
    likes.value = likes.value.concat(response.res.records)
    cursor = response.res.cursor
    if (response.res.records.length == 0) {
      completed.value = true
      return
    }
    await getPosts(response.res.records)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const getPosts = async (likes) => {
  let uris = []
  likes.forEach(el => {
    uris.push(el.value.subject.uri)
  })
  const response = await requestGet.get("app.bsky.feed.getPosts", { uris: uris })
  response.res.posts.forEach(el => {
    timeline.value.add({ post: el })
  })
}

const stopRouteWatch = watch(
  () => route.currentRoute,
  async () => {
    handle.value = await getHandle()
    await getLikes(handle.value, cursor)
  })

onUnmounted(stopRouteWatch)
</script>