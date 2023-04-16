<template>
  <FeedView :timeline="timeline"></FeedView>
  <infinite-loading @infinite="infiniteHandler" :firstload=false>
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

export default {
  components: {
    FeedView,
    InfiniteLoading
  },
  name: 'App',
  data() {
    return {
      complated: false,
      timeline: { feed: [] },
      cursor: null,
    };
  },
  beforeMount() {
    this.getPopular(this.cursor)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        $state.loaded()
        await this.getPopular(this.cursor)
      }
    },
    async getPopular(cursor) {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.unspecced.getPopular", { params })
        console.log(response)
        this.timeline.feed = this.timeline.feed.concat(response.data.feed)
        this.cursor = response.data.cursor
        if (response.data.feed.length == 0) {
          this.complated = true
        }
      } catch (e) {
        console.log(e)
        this.$toast.show(e.data.error + " " + e.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    }
  }
};
</script>