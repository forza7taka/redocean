<template>
<div v-if="complated == true" v-scroll="onScroll">
<FeedView :timeline="timeline"></FeedView>
</div>
</template>

<script>
import FeedView from "./FeedView.vue"
export default {
  components: {
    FeedView
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
    onScroll() {
      if (this.isComplete) {
        return;
      }
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop <= clientHeight) {
        this.getPopular(this.cursor)
      }
    },    
    async get() {
      await this.getUri()
      if (this.uri) {
      await this.getTimelineByUri()
      } else {
      await this.getPopular(this.cursor)
      }
    },
    async getUri() {
      if (this.$route.params.uri) {
        this.uri = this.$route.params.uri  
      } else {
        this.uri = null
      }
    },
    async getPopular(cursor) {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = {before: cursor}
      }
      console.log(params)
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      this.axios.get('https://bsky.social/xrpc/app.bsky.unspecced.getPopular', { params })
          .then(response => {
            console.log(response) 
            this.timeline.feed = this.timeline.feed.concat(response.data.feed)
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