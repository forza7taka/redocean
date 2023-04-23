<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <template v-slot:prepend>
        <v-avatar color="grey" size="150" rounded="0">
          <v-img cover v-bind:src=profile.avatar alt="avatar"></v-img>
        </v-avatar>
      </template>
      <v-card-text class="text-pre-wrap">
        <v-text-field v-model="profile.handle" label="handle"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn icon @click="updateHandle"><v-icon>mdi-content-save</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'

const profile = ref(null)
const toast = createToaster()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const store = useStore()

onBeforeMount(async () => {
  await getProfile(store.getters.getHandle)
})

const getProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    profile.value = response.res
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const updateHandle = async () => {
  try {
    const response = await requestPost.post("com.atproto.identity.updateHandle", { handle: profile.value.handle })
    const store = useStore()
    store.dispatch('setHandle', response.req.handle);
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

</script>