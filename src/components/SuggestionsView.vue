<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        suggestions
      </v-card-title>
    </v-card>
    <UsersView :users="actors"></UsersView>
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
import UsersView from './UsersView.vue'
import { ref, onBeforeMount } from 'vue'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import { useIntersectionObserver } from '@vueuse/core'

import { useStore } from 'vuex'

const store = useStore()

const complated = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const actors = ref([])
const loading = ref(null)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    await getSuggestions()
    return
  }

  await getSuggestions(cursor)
})

onBackupState(() => actors);

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getSuggestions(cursor)
    }
  },
)

const getSuggestions = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.actor.getSuggestions", params)
    actors.value = actors.value.concat(response.res.actors)
    cursor = response.res.cursor
    if (response.res.actors.length == 0) {
      complated.value = true
    }
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}
</script>