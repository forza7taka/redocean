<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Suggestions"></v-toolbar>
    <UsersView :users="actors.array"></UsersView>
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
import { ref, onBeforeMount } from 'vue'
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import { useIntersectionObserver } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';
import Users from '@/common/users.js'

import { useStore } from 'vuex'

const store = useStore()

const completed = ref(false)
const cursor = ref(null)
const historyState = useHistoryState();
const actors = ref(new Users())
const loading = ref(null)
const loadingCount = ref(0)

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
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getSuggestions(cursor)
    }
    loadingCount.value = loadingCount.value + 1
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
    actors.value.setArray(response.res.actors)
    cursor = response.res.cursor
    if (response.res.actors.length == 0) {
      completed.value = true
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
</script>