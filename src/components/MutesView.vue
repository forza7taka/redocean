<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        <router-link :to="`/profile/${this.$store.getters.getHandle}`">
          <v-avatar color="surface-variant">
            <v-img v-if="subject" cover v-bind:src=subject.avatar alt="avatar"></v-img>
            </v-avatar>
        </router-link>
        @{{ this.$store.getters.getHandle }} mutes
      </v-card-title>
    </v-card>
    <UsersView :users="mutes"></UsersView>
    <div ref="load">
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
import { useIntersectionObserver } from '@vueuse/core'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'

const complated = ref(false)
const fetchedMutes = ref({ feed: [] })
const cursor = ref(null)
const historyState = useHistoryState();
const mutes = ref(historyState.data || fetchedMutes)
const store = useStore()
const load = ref(null)

onBeforeMount(async () => {
  await getProfile(store.getters.getHandle)
  await getMutes()
  if (historyState.action === 'reload') {
    mutes.value = fetchedMutes.value
  }
});

onBackupState(() => mutes);

useIntersectionObserver(
  load,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      await getMute()
    }
  }
)

const getProfile = async (handle) => {


      try {
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.actor.getProfile", {
          params: {
            actor: handle
          }
        })
        this.subject = response.data
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },

  async getMutesProfile(handle) {
      try {
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.actor.getProfile", {
          params: {
            actor: handle
          }
        })
        this.muteActors = this.muteActors.concat(response.data)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },

  async getMutes(cursor) {
      let params = {}
      if (!cursor) {
        params = { }
      } else {
        params = { cursor: cursor }
      }
      try {
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.graph.getMutes", { params })
        this.cursor = response.data.cursor
        if (response.data.mutes.length == 0) {
          this.complated = true
        }
        for (let i = 0; i < response.data.mutes.length - 1; i++) {
          await this.getProfile(response.data.mutes[i].did)
        }
        this.mutes = this.mutes.concat(response.data.mutes)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    }
  }
}
</script>