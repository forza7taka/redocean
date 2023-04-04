<template>
  <FeedView :timeline="timeline"></FeedView>
  <infinite-loading @infinite="infiniteHandler" immediate-check="false">
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
      uri: null,
      cursor: null,
    };
  },
  watch: {
    $route() {
      // this.get()
    },
  },
  beforeMount() {
    // this.get()
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
    async get() {
      await this.getUri()
      if (this.uri) {
        await this.getTimelineByUri()
      } else {
        await this.getTimeline(this.cursor)
      }
    },
    async getUri() {
      if (this.$route.params.uri) {
        this.uri = this.$route.params.uri
      } else {
        this.uri = null
      }
    },
    async getTimeline(cursor) {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getTimeline', { params })
        console.log(response)
        this.timeline.feed = this.timeline.feed.concat(response.data.feed)
        console.log(this.timeline.feed)
        this.cursor = response.data.cursor
        if (response.data.feed.length == 0) {
          this.complated = true
        }
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getTimelineByUri() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getPostThread', {
          params: {
            uri: this.uri
          }
        })
        console.log(response.data)
        this.timeline = response.data
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
  }
};
</script>