<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        suggestions
      </v-card-title>
    </v-card>
    <UsersView :users="actors"></UsersView>
    <infinite-loading @infinite="load" :firstload=false>
      <template #spinner>
        <span>loading...</span>
      </template>
      <template #complete>
        <span>No more data found!</span>
      </template>
    </infinite-loading>
  </div>
</template>
<script>
import UsersView from './UsersView.vue'
import InfiniteLoading from 'v3-infinite-loading'
import { ref, provide, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
export default {
  components: {
    UsersView,
    InfiniteLoading,
  },
  async setup() {
    const complated = ref(false)
    const fetchedActors = ref([])
    const cursor = ref(null)
    const historyState = useHistoryState();
    const actors = ref(historyState.data || fetchedActors)
    const isLoading = ref(false)
    provide('store', useStore())

    onBeforeMount(async () => {
      getSuggestions(cursor)
      if (historyState.action === 'reload') {
        actors.value = fetchedActors.value
      }
    });

    onBackupState(() => actors);

    const load = async ($state) => {
      if (isLoading.value) {
        return
      }
      if (complated.value) {
        $state.complete()
      } else {
        isLoading.value = true
        await getSuggestions(cursor.value)
        isLoading.value = false
        $state.loaded()
      }
    }

    const getSuggestions = async (cursor) => {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = { cursor: cursor.value }
      }
      try {
        const req = useRequestGet()
        const response = await req.get("app.bsky.actor.getSuggestions", params)

        fetchedActors.value = fetchedActors.value.concat(response.res.actors)
        console.log(fetchedActors.value)
        cursor = response.res.cursor
        if (response.res.actors.length == 0) {
          complated.value = true
        }
      } catch (e) {
        const toast = createToaster()
        toast.error(e, { position: "top-right" })
      }
    }

    return {
      actors,
      load
    }
  }
}
</script>