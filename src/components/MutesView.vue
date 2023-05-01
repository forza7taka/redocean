<template>
  <div>
    <v-card width="380px" class="mx-auto mt-5">
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
          <v-progress-circular v-if="!complated" model-value="20"></v-progress-circular>
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
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'

const complated = ref(false)
const mutes = ref([])
const cursor = ref(null)
const historyState = useHistoryState();
const store = useStore()
const loading = ref(null)
const requestGet = useRequestGet(store)
const toast = createToaster()
const muteActors = ref([])
const subject = ref(null)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    await getProfile(store.getters.getHandle)
    await getMutes(cursor)
    await getMutes(cursor)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    subject.value = historyState.subject
    muteActors.value = historyState.muteActors
    mutes.value = historyState.mutes
    return
  }
});

onBackupState(() => ({ mutes: mutes, subject: subject, muteActors: muteActors }));

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getProfile(store.getters.getHandle)
      await getMutes(cursor)
      await getMutes(cursor)
    }
  }
)

const getProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    subject.value = response.res
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getMutesProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    muteActors.value = muteActors.value.concat(response.res)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
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
      complated.value = true
      return
    }
    for (let i = 0; i < response.res.mutes.length - 1; i++) {
      await getMutesProfile(response.res.mutes[i].did)
    }
    mutes.value = mutes.value.concat(response.res.mutes)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>