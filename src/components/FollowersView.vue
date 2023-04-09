<template>
  <div>

    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        <router-link :to="`/profile/${this.$route.params.handle}`">
          <v-avatar color="surface-variant">
            <v-img cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
        @{{ subject.handle }} followers
      </v-card-title>
    </v-card>
    <UsersView :users="followers"></UsersView>
    <infinite-loading @infinite="infiniteHandler" :firstload=false>
        <template #spinner>
        <span>loading...</span>
      </template>
      <template #complete>
        <span>No more data found!</span>
      </template>
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
      followers: [],
      cursor: null,
      subject: {}
    }
  },
  beforeMount() {
    this.getFollowers(this.$route.params.handle, this.cursor)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.isComplete) {
        $state.complete()
      } else {
        $state.loaded()
        await this.getFollowers(this.$route.params.handle, this.cursor)
      }
    },
    async getFollowers(handle, cursor) {
      let params = {}
      if (!cursor) {
        params = { actor: handle }
      } else {
        params = { actor: handle, cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getFollowers", { params })
          .then(response => {
            console.log(response.data)
            this.cursor = response.data.cursor
            if (response.data.followers.length == 0) {
              this.complated = true
            }
            this.followers = this.followers.concat(response.data.followers)
            this.subject = response.data.subject
          })
        console.log(response)
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