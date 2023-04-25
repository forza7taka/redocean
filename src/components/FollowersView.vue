<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5" v-if="subject">
      <v-card-title>
        <router-link :to="`/profile/${route.params.handle}`">
          <v-avatar color="surface-variant">
            <v-img cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
        @{{ subject.handle }} followers
      </v-card-title>
    </v-card>
    <UsersView :users="followers"></UsersView>
    <div ref="load">
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
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
import { useRoute } from "vue-router";
import { useStore } from 'vuex'
const store = useStore()
const route = useRoute()
const complated = ref(false)
const followers = ref([])
const followersCursor = ref(null)
const historyState = useHistoryState();
const load = ref(null)
const requestGet = useRequestGet(store)
const toast = createToaster()
const subject = ref(null)

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
    if (isIntersecting && !complated.value && followersCursor.value) {
      await getFollowers(route.params.handle, followersCursor)
    }
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
    followers.value = followers.value.concat(response.res.followers)
    followersCursor.value = response.res.cursor
    if (response.res.followers.length == 0) {
      complated.value = true
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>