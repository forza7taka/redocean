<template>
  <div>
    <div>

      <v-text-field label="xxxx.bsky.social or mailaddress" placeholder="xxxx.bsky.social or mailaddress"
        color="green darken-5" clearable dense v-model="handle"></v-text-field>
    </div>
    <div>
      <v-text-field label="password" placeholder="password" color="green darken-5" clearable dense type="password"
        v-model="password"></v-text-field>
    </div>
    <v-row justify="center">
      <v-btn @click.prevent="login">Login</v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  components: {
  },
  data() {
    return {
      handle: '',
      password: '',
      cursor: null,
      completed: false,
      failed: false
    }
  },
  async mounted() {
    try {
      if (this.failed) {
        return
      }
      if ((this.$store.getters.getDid) && (this.$store.getters.getAccessJwt)) {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getRefreshJwt
        let response = await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.server.refreshSession")
        this.$store.dispatch('doCreateSession', response.data)
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        this.$router.push('/timeline')
      }
    } catch (e) {
      this.failed = true
      console.log("error refresh")
    }
  },
  methods: {
    async login() {
      this.failed = false
      try {
        let response = await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.server.createSession", {
          identifier: this.handle,
          password: this.password
        })
        this.$store.dispatch('doCreateSession', response.data)
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        while (!this.completed) {
          await this.getFollows(this.handle, this.cursor)
        }
        this.completed = false
        while (!this.completed) {
          await this.getLikes(this.cursor)
        }
        this.completed = false
        while (!this.completed) {
          await this.getMutes(this.cursor)
        }
        this.$router.push('/timeline')
      } catch (e) {
        console.log(e)
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
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
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.graph.getFollows", { params })
        this.cursor = response.data.cursor
        if (response.data.follows.length == 0) {
          this.completed = true
          return
        }
        this.$store.dispatch('doAddFollows', response.data)
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
        params = {}
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "app.bsky.graph.getMutes", { params })
        this.cursor = response.data.cursor
        if (response.data.mutes.length == 0) {
          this.completed = true
          return
        }
        this.$store.dispatch('doAddMutes', response.data)
      } catch (e) {
        console.log(e)
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getLikes(cursor) {
      try {
        let params = {}
        if (!cursor) {
          params = {
            repo: this.$store.getters.getDid,
            collection: "app.bsky.feed.like",
            limit: 50
          }
        } else {
          params = {
            repo: this.$store.getters.getDid,
            collection: "app.bsky.feed.like",
            cursor: cursor
          }
        }

        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get(process.env.VUE_APP_BASE_URI + "com.atproto.repo.listRecords", {
          params
        })
        this.cursor = response.data.cursor
        if (response.data.records.length == 0) {
          this.completed = true
          return
        }
        this.$store.dispatch('doAddLikes', response.data)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
        this.completed = true
      }
    }
  }
}
</script>