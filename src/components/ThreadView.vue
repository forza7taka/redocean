<template>
  <div v-if="thread">

    <Post :post="thread.post"></Post>

    <div v-if="thread.replies">
      <v-list>
        <v-list-item v-for="(r, rIndex) in thread.replies" :key="rIndex">
          <Post :post="r.post"></Post>
          <div v-if="r.replies">
            <v-list>
              <v-list-item v-for="(r2, r2Index) in r.replies" :key="r2Index">
                <Post :post="r2.post"></Post>
              </v-list-item>
            </v-list>
          </div>
        </v-list-item>
      </v-list>
    </div>





  </div>
</template>

<script >
import Post from "./Post.vue"
export default {
  components: {
    Post,
  },
  name: 'App',
  data() {
    return {
      thread: null,
      cursor: null,
    };
  },
  beforeMount() {
    this.getThread(this.cursor)
  },
  methods: {
    async getThread() {
      let params = { uri: this.$route.params.uri }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getPostThread', { params })
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