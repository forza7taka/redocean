<template>
  <FeedView :timeline="timeline"></FeedView>
  <infinite-loading @infinite="load" :firstload="false">
    <template #spinner>
      <span>loading...</span>
    </template>
    <template #complete>
      <span>No more data found!</span>
    </template>
  </infinite-loading>
</template>

<script>
import FeedView from "./FeedView.vue"
import InfiniteLoading from 'v3-infinite-loading'
import { ref, provide, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRequestGet } from '../common/requestGet.js'
export default {
  components: {
    FeedView,
    InfiniteLoading
  },
  async setup() {
    const complated = ref(false)
    const fetchedTimeline = ref({ feed: [] })
    const cursor = ref(null)
    const historyState = useHistoryState();
    const timeline = ref(historyState.data || fetchedTimeline)
    provide('store', useStore())

    onBeforeMount(async () => {
      getTimeline(cursor)
      if (historyState.action === 'reload') {
        timeline.value = fetchedTimeline.value
      }
    });

    onBackupState(() => timeline);

    const load = async ($state) => {
      if (complated.value) {
        $state.complete()
      } else {
        await getTimeline(cursor.value)
        $state.loaded()
      }
    }

    const getTimeline = async (cursor) => {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = { cursor: cursor.value }
      }
      try {
        const req = useRequestGet()
        const response = await req.get("app.bsky.feed.getTimeline", params)
        fetchedTimeline.value.feed = fetchedTimeline.value.feed.concat(response.res.feed)
        cursor = response.res.cursor
        if (response.res.feed.length == 0) {
          complated.value = true
        }
      } catch (e) {
        const toast = createToaster()
        toast.error(e, { position: "top-right" })
      }
    }

    return {
      timeline,
      load
    }
  },
};
</script>