<template>
  <div class="displayArea mx-auto">
    <v-card class="mx-auto mt-5" v-if="subject">
      <v-card-title>
        <router-link :to="`/profile/${store.getters.getHandle}`">
          <v-avatar color="surface-variant">
            <v-img v-if="subject" cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
        @{{ store.getters.getHandle }} mutes
      </v-card-title>
    </v-card>
    <UsersView :users="mutes"></UsersView>
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
const mutes = ref([])
const cursor = ref(null)
const historyState = useHistoryState();
const store = useStore()
const loading = ref(null)
const requestGet = useRequestGet(store)
const muteActors = ref([])
const subject = ref(null)
const loadingCount = ref(0)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    subject.value = historyState.subject
    await getMutes(cursor)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    muteActors.value = historyState.muteActors
    mutes.value = historyState.mutes
    return
  }
  await getProfile(store.getters.getHandle)
  await getMutes(cursor)
});

onBackupState(() => ({ mutes: mutes, subject: subject, muteActors: muteActors }));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getProfile(store.getters.getHandle)
      await getMutes(cursor)
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

const getMutesProfile = async (handle) => {
  const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
  muteActors.value = muteActors.value.concat(response.res)

}

const getMutes = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    let response = await requestGet.get("app.bsky.graph.getMutes", params)
    cursor.value = response.res.cursor
    if (response.res.mutes.length == 0) {
      completed.value = true
      return
    }
    for (let i = 0; i < response.res.mutes.length - 1; i++) {
      await getMutesProfile(response.res.mutes[i].did)
    }
    mutes.value = mutes.value.concat(response.res.mutes)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
</script>