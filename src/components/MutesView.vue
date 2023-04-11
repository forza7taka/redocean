<template>
  <div>

    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        <router-link :to="`/profile/${this.$store.getters.getHandle}`">
          <v-avatar color="surface-variant">
            <!--<v-img cover v-bind:src=subject.avatar alt="avatar"></v-img>
          -->
            </v-avatar>
        </router-link>
        @{{ this.$store.getters.getHandle }} mutes
      </v-card-title>
    </v-card>
    <UsersView :users="mutes"></UsersView>
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
      mutes: [],
      cursor: null,
    }
  },
  beforeMount() {
    this.getMutes()
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        $state.loaded()
        await this.getMutes(this.cursor)
      }
    },
    async getMutes(cursor) {
      let params = {}
      if (!cursor) {
        params = { }
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getMutes", { params })
        console.log(response.data)
        this.cursor = response.data.cursor
        if (response.data.mutes.length == 0) {
          this.complated = true
        }
        this.mutes = this.mutes.concat(response.data.mutes)
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