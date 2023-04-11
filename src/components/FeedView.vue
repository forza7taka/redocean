<template>
  <v-list>
    <v-list-item v-for="(f, fIndex) in timeline.feed" :key="fIndex">
      <v-row>
        <v-col class="d-flex justify-center align-center">
          <PostView v-if="f.reply" :post="f.post" :reason="f.reason" :parent="f.reply.parent" :root="f.reply.root" :depth="0"></PostView>
          <PostView v-if="!f.reply" :post="f.post" :reason="f.reason" :depth="0"></PostView>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script>
import PostView from "./PostView.vue"
export default {
  components: {
    PostView
  },
  name: "App",
  data() {
    return {
      menu: false,
      dialog: false,
      parent: {},
      root: {},
    };
  },
  props: {
    timeline: {}
  },
  methods: {
    getUri(uri) {
      return Buffer.from(uri).toString('base64')
    },
    async deletePost(uri) {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.deleteRecord', {
          collection: "app.bsky.feed.post",
          repo: this.$store.getters.getDid,
          rkey: String(uri).substr(-13)
        })
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async repost(feed) {
      try {
        let subject = { uri: feed.post.uri, cid: feed.post.cid }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          collection: "app.bsky.feed.repost",
          repo: this.$store.getters.getDid,
          record: {
            createdAt: new Date(),
            $type: "app.bsky.feed.repost",
            subject: subject
          }
        })
        console.log(response)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async like(feed) {
      try {
        if (!this.$store.getters.hasLike(feed.post.uri)) {
          let subject = { uri: feed.post.uri, cid: feed.post.cid }
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: "app.bsky.feed.like",
            repo: this.$store.getters.getDid,
            record: {
              subject: subject,
              createdAt: new Date()
            }
          })
          feed.post.likeCount = feed.post.likeCount + 1
          // for (let i = 0; i < timeline.feed; i++) {
          //   if (this.timeline.feed[i].post.uri = feed.post.uri) {
          //     this.timeline.feed[i].post.likeCount = this.timeline.feed[i].post.likeCount + 1
          //   }
          // }
          console.log(response.data.uri)
          this.$store.dispatch('doAddLike', { key: feed.post.uri, value: response.data.uri });
        } else {
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.deleteRecord', {
            collection: "app.bsky.feed.like",
            repo: this.$store.getters.getDid,
            rkey: this.$store.getters.getLikes.get(feed.post.uri).substr(-13)
          })
          feed.post.likeCount = feed.post.likeCount - 1
          // for (let i = 0; i < timeline.feed; i++) {
          //   if (this.timeline.feed[i].post.uri = feed.post.uri) {
          //     this.timeline.feed[i].post.likeCount = this.timeline.feed[i].post.likeCount - 1
          //   }
          // }
          this.$store.dispatch('doRemoveLike', feed.post.uri);
        }
      } catch (e) {
        console.log(e)
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    onClose(value) {
      this.dialog = value;
    },
    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    }

  }
}
</script>
