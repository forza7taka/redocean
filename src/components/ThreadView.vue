<template>
  <FeedView :timeline="timeline"></FeedView>
  <infinite-loading @infinite="infiniteHandler" :firstload="false">
      <template #spinner>
        <span>loading...</span>
      </template>
      <template #complete>
        <span>No more data found!</span>
      </template>
  </infinite-loading>
</template>

<script >
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
    this.getThread(this.cursor)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        await this.getTimeline(this.cursor)
        $state.loaded()
      }
    },
    async getThread() {
      let params = { uri: this.$route.params.uri }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getPostThread', { params })
        console.log(response)
        this.timeline.feed = this.timeline.feed.concat(response.data.feed)
        this.cursor = response.data.cursor
        if (response.data.feed.length == 0) {
          this.complated = true
        }
      } catch (e) {
        this.$toast.show(e, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    }
  }
};
</script>