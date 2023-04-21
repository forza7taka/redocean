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
    <UsersView v-if="followers" :users="followers"></UsersView>
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

const route = useRoute()
const complated = ref(false)
const fetchedFollowers = ref([])
const cursor = ref(null)
const historyState = useHistoryState();
const followers = ref(historyState.data || fetchedFollowers)
const load = ref(null)
const requestGet = useRequestGet()
const toast = createToaster()
const subject = ref(null)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    followers.value = fetchedFollowers.value
  }
});

onBackupState(() => followers);

useIntersectionObserver(
  load,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getFollowers(route.params.handle, cursor)
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
    fetchedFollowers.value = fetchedFollowers.value.concat(response.res.followers)
    cursor.value = response.res.cursor
    if (response.res.followers.length == 0) {
      complated.value = true
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>