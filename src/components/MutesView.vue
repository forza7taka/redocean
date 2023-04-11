<template>
  <div>

    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        <router-link :to="`/profile/${this.$store.getters.getHandle}`">
          <v-avatar color="surface-variant">
            <v-img v-if="subject" cover v-bind:src=subject.avatar alt="avatar"></v-img>
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
      muteActors:[],
      cursor: null,
      subject: null
    }
  },
  beforeMount() {
    this.getProfile(this.$store.getters.getHandle)
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
    async getProfile(handle) {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
          params: {
            actor: handle
          }
        })
        this.subject = response.data
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getMutesProfile(handle) {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
          params: {
            actor: handle
          }
        })
        console.log(response.data)
        this.muteActors = this.muteActors.concat(response.data)
        console.log(this.profile)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
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
        this.cursor = response.data.cursor
        if (response.data.mutes.length == 0) {
          this.complated = true
        }
        for (let i = 0; i < response.data.mutes.length - 1; i++) {
          await this.getProfile(response.data.mutes[i].did)
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