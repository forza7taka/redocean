<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        Likes
      </v-card-title>
    </v-card>
    <v-list-item v-for="(f, fIndex) in timeline.feed" :key="fIndex">
      <v-row>
        <v-col class="d-flex justify-center align-center">
          <PostView v-if="f.reply" :post="f.post" :reason="f.reason" :parent="f.reply.parent" :root="f.reply.root"
            :depth="0"></PostView>
          <PostView v-if="!f.reply" :post="f.post" :reason="f.reason" :depth="0"></PostView>
        </v-col>
      </v-row>
    </v-list-item>

    <infinite-loading @infinite="infiniteHandler" :firstload="false">
      <template #spinner>
        <span>loading...</span>
      </template>
      <template #complete>
        <span>No more data found!</span>
      </template>
    </infinite-loading>
  </div>
</template>

<script >
import PostView from "./PostView.vue"
import InfiniteLoading from 'v3-infinite-loading'
export default {
  components: {
    PostView,
    InfiniteLoading
  },
  name: 'App',
  data() {
    return {
      complated: false,
      timeline: { feed: [] },
      cursor: null,
      likes: [],
      authors: new Map(),
      handle: null
    };
  },
  watch: {
    likes: {
      handler(nv) {
        this.getPosts(nv)
      },
      deep: true
    },
    '$route.params.handle': {
      async handler() {

        this.handle = await this.getHandle()
        console.log(this.handle)
        await this.getLikes(this.handle, this.cursor)
      }
    }
  },
  async beforeMount() {
    this.handle = await this.getHandle()
    await this.getLikes(this.handle, this.cursor)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        await this.getLikes(this.handle, this.cursor)
        $state.loaded()
      }
    },
    async getHandle() {
      if (this.$route.params.handle) {
        return this.$route.params.handle
      }
      return this.$store.getters.getHandle
    },
    async getLikes(handle, cursor) {
      try {
        let params = {}
        if (!cursor) {
          params = {
            repo: handle,
            collection: "app.bsky.feed.like",
            limit: 30
          }
        } else {
          params = {
            repo: handle,
            collection: "app.bsky.feed.like",
            cursor: cursor
          }
        }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "com.atproto.repo.listRecords", {
          params
        })
        console.log(response.data)

        this.likes = this.likes.concat(response.data.records)
        this.cursor = response.data.cursor
        if (response.data.records.length == 0) {
          this.isComplete = true
          return
        }
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getPosts(likes) {
      try {
        for (var i = 0; i < likes.length; i++) {
          try {
            this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
            let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.feed.getPostThread", {
              params: {
                uri: likes[i].value.subject.uri
              }
            })
            console.log(response.data.thread.post)
            let post = { post: response.data.thread.post }
            this.timeline.feed = this.timeline.feed.concat(post)
          } catch (e) {
            if (e.response && e.response.status === 400) {
              continue
            }
            throw e
          }
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
  }
};
</script>