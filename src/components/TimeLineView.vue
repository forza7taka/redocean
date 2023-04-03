<template>
  <div v-if="complated == true">    
      <FeedView :timeline="timeline"></FeedView>
      <infinite-loading @infinite="infiniteHandler">
      </infinite-loading>
</div>
</template>

<script>
import FeedView from "./FeedView.vue"
import InfiniteLoading from 'v3-infinite-loading'
export default {
  components: {
    FeedView,
    InfiniteLoading
  },
  name:'App',
  data() {
    return {
      complated: false,
      timeline: {feed:[]},
      uri: null,
      cursor: null,
      isComplete: false
    };
  },
  watch: {
      $route() {
        this.get()
      },
  },
  beforeMount() {
    this.get()
  },
  methods: {
    infiniteHandler($state) {
      if (this.isComplete) {
        $state.complete()
      } else {
        this.getTimeline(this.cursor)
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
        params = {cursor: cursor}
      }
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      await this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getTimeline', { params })
          .then(response => {
            console.log(response) 
            this.timeline.feed = this.timeline.feed.concat(response.data.feed)
            console.log(this.timeline.feed) 
            this.complated = true
            this.cursor = response.data.cursor
            if (response.data.feed.length == 0) {
              this.isComplete = true
            }
          })
          .catch(err => {
            console.error(err)
          })
    },
    async getTimelineByUri() {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getPostThread', {
        params: {
          uri: this.uri
        }
        })
        .then(response => {
            console.log(response.data)
            this.timeline = response.data
            this.complated = true
        })
        .catch(err => {
          console.error(err)
        })
    },
  } 
};
</script>