<template>
  <div>
      <div>
        <v-text-field
          label="xxxx.bsky.social or mailaddress"
          placeholder="xxxx.bsky.social or mailaddress"
          color="green darken-5"
          clearable
          dense
          v-model="handle"
        ></v-text-field>
      </div>
      <div>
        <v-text-field
          label="password"
          placeholder="password"
          color="green darken-5"
          clearable
          dense
          type="password" 
          v-model="password"
        ></v-text-field>
      </div>
      <v-row justify="center">
        <v-btn @click.prevent="login">Login</v-btn>
      </v-row>
      <v-row justify="center">
        <v-btn @click.prevent="this.$router.push('/accountCreate')">Create</v-btn>
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
      message:"",
      follows: [],
      cursor: null,
      isComplete: false
    }
  },
  mounted() {
    if ((this.$store.getters.getDid) && (this.$store.getters.getAccessJwt)) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getRefreshJwt
      this.axios.post('https://bsky.social/xrpc/com.atproto.server.refreshSession')
      .then(response => {
        this.$store.dispatch('doCreateSession', response.data)
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        console.log(response.data)
        this.$router.push('/timeline')
      })
      .catch(err => {
        console.error(err)
        this.message = err
      })
    }
  },
  methods: {
    async login() {
      await this.axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
        handle: this.handle,
        password: this.password
      })
      .then(response => {
        this.$store.dispatch('doCreateSession', response.data)
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        console.log(response.data)
      })
      .catch(err => {
        console.error(err)
        this.message = err
        return
      })
      while (!this.isComplete) {
        await this.getFollows(this.handle, this.cursor)
      }
      this.store
      this.$router.push('/timeline')
    },
    async getFollows(handle, cursor) {
      let params = {}
      if (!cursor) {
        params = {actor: handle}
      } else {
        params = {actor: handle, cursor: cursor}
      } 
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getFollows", {params})
      .then(response => {
        console.log(response.data)
        this.cursor = response.data.cursor
        if (response.data.follows.length == 0) {
          this.isComplete = true
          return
        }
        this.$store.dispatch('doAddFollows', response.data)
      })
      .catch(err => {
        console.error(err)
      })
    }
  }
}
</script>