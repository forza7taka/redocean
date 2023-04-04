<template>
  <div>

    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        <router-link :to="`/profile/${this.$route.params.handle}`">
          <v-avatar color="surface-variant">
            <v-img cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
        @{{ subject.handle }} follows
      </v-card-title>
    </v-card>
    <UsersView :users="follows"></UsersView>
    <infinite-loading @infinite="infiniteHandler" :firstload=false>
    </infinite-loading>
  </div>
</template>

<script>
import UsersView from './UsersView.vue'
import InfiniteLoading from 'v3-infinite-loading'

export default {
  components: {
    UsersView,
    InfiniteLoading
  },
  data() {
    return {
      complated: false,
      follows: [],
      cursor: null,
      subject: {}
    }
  },
  beforeMount() {
    this.getFollows(this.$route.params.handle)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        $state.loaded()
        await this.getFollows(this.$route.params.handle, this.cursor)
      }
    },
    async getFollows(handle, cursor) {
      let params = {}
      if (!cursor) {
        params = { actor: handle }
      } else {
        params = { actor: handle, cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getFollows", { params })
        this.cursor = response.data.cursor
        if (response.data.follows.length == 0) {
          this.complated = true
        }
        this.follows = this.follows.concat(response.data.follows)
        this.subject = response.data.subject
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    }
  }
}
</script>