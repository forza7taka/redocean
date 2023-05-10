<template>
  <div v-if="thread" class="displayArea mx-auto">
    <v-row>
      <v-col class="justify-center align-center">
        <PostView :post="thread.post" :root="thread.post" :replies="thread.replies" :depth=0 />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import PostView from "./PostView.vue"
import { ref, watch, onBeforeMount } from 'vue'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestGet } from '../common/requestGet.js'
import { useRoute } from "vue-router";
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()
const thread = ref(null)
const cursor = ref(null)

onBeforeMount(async () => {
  await getThread(cursor)
})

const getThread = async () => {
  try {
    if (!route.params.uri) {
      return
    }
    const params = { uri: route.params.uri }
    const req = useRequestGet(store)
    const response = await req.get("app.bsky.feed.getPostThread", params)
    thread.value = response.res.thread
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}

watch(route, () => getThread())
</script>