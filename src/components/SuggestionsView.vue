<template>
  <div>
      <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        suggestions
      </v-card-title>
    </v-card>
    <UsersView :users="actors"></UsersView>
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
      actors: [],
      cursor: null,
    }
  },
  beforeMount() {
    this.getSuggestions(this.cursor)
  },
  methods :{
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        $state.loaded()
        await this.getSuggestions(this.cursor)
      }
    },
    async getSuggestions(cursor) {
      try {
        let params = {}
        if (!cursor) {
          params = {}
          this.actors = []
        } else {
          params = { cursor: cursor }
        }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.actor.getSuggestions", { params })
        console.log(response.data)
        this.cursor = response.data.cursor
        if (response.data.actors.length == 0) {
          this.complated = true
        }
        this.actors = this.actors.concat(response.data.actors)
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