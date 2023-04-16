<template>
  <div v-if="thread">
    <PostView :post="thread.post" :root="thread.post" :replies="thread.replies" :depth=0>
    </PostView>
  </div>
</template>

<script >
import PostView from "./PostView.vue"
export default {
  components: {
    PostView,
  },
  name: 'App',
  data() {
    return {
      thread: null,
      cursor: null,
    };
  },
  watch: {
    '$route.params.uri': {
      async handler() {
        if (this.$route.params.uri) {
          this.getThread(this.cursor)
        }
      }
    }
  },
  beforeMount() {
    this.getThread(this.cursor)
  },
  methods: {
    async getThread() {
      let params = { uri: this.$route.params.uri }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.feed.getPostThread", { params })
        console.log(response)
        this.thread = response.data.thread
      } catch (e) {
        console.log(e)
        this.$toast.show(e, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    }
  }
};
</script>