<template>
  <div class="displayArea mx-auto">
    <v-toolbar>
      <div style="padding-left: 10px">
        <router-link :to="`/profile/${route.params.handle}`">
          <v-avatar v-if="subject" color="surface-variant">
            <v-img cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
      </div>
      <div v-if="subject" style="padding-left: 10px">
        @{{ subject.handle }} followers
      </div>
    </v-toolbar>
    <UsersView :users="followers.array"></UsersView>
    <div ref="load">
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
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import { useRoute } from "vue-router";
import { useStore } from 'vuex'
import { useCatchError } from '@/common/catchError';
import Users from '@/common/users.js'

const store = useStore()
const route = useRoute()
const completed = ref(false)
const followers = ref(new Users())
const followersCursor = ref(null)
const historyState = useHistoryState();
const load = ref(null)
const requestGet = useRequestGet(store)
const subject = ref(null)
const loadingCount = ref(0)


onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    await getFollowers(route.params.handle)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    followers.value = historyState.data.followers
    subject.value = historyState.data.subject
    return
  }
  await getFollowers(route.params.handle)
});

onBackupState(() => ({ followers: followers, subject: subject }));

useIntersectionObserver(
  load,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completed.value && loadingCount.value != 0) {
      await getFollowers(route.params.handle, followersCursor)
    }
    loadingCount.value = loadingCount.value + 1
  }
)

const getFollowers = async (handle, cursor) => {
  let params = {}
  if (!cursor) {
    params = { actor: handle }
  } else {
    params = { actor: handle, cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getFollowers", params)
    subject.value = response.res.subject
    followers.value.setArray(response.res.followers)
    followersCursor.value = response.res.cursor
    if (response.res.followers.length == 0) {
      completed.value = true
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)

  }
}
</script>