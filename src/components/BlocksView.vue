<template>
  <div class="displayArea mx-auto">
    <v-toolbar>
      <div style="padding-left: 10px">
        <router-link :to="`/profile/${store.getters.getHandle}`">
          <v-avatar color="surface-variant">
            <v-img v-if="subject" cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
      </div>
      <div style="padding-left: 10px">
        @{{ store.getters.getHandle }} blocks
      </div>
    </v-toolbar>
    <UsersView :users="blocks"></UsersView>
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

import UsersView from './UsersView.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import { useCatchError } from '@/common/catchError';

const completed = ref(false)
const blocks = ref([])
const cursor = ref(null)
const historyState = useHistoryState();
const store = useStore()
const loading = ref(null)
const requestGet = useRequestGet(store)
const blockActors = ref([])
const subject = ref(null)
const loadingCount = ref(0)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    subject.value = historyState.subject
    await getBlocks(cursor)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    subject.value = historyState.subject
    blockActors.value = historyState.blockActors
    blocks.value = historyState.blocks
    return
  }
  await getProfile(store.getters.getHandle)
  await getBlocks(cursor)
});

onBackupState(() => ({ blocks: blocks, subject: subject, blockActors: blockActors }));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getProfile(store.getters.getHandle)
      await getBlocks(cursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const getProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    subject.value = response.res
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const getBlocksProfile = async (handle) => {
  const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
  blockActors.value = blockActors.value.concat(response.res)
}

const getBlocks = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    let response = await requestGet.get("app.bsky.graph.getBlocks", params)
    cursor.value = response.res.cursor
    if (response.res.blocks.length == 0) {
      completed.value = true
      return
    }
    for (let i = 0; i < response.res.blocks.length - 1; i++) {
      await getBlocksProfile(response.res.blocks[i].did)
    }
    blocks.value = blocks.value.concat(response.res.blocks)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
</script>