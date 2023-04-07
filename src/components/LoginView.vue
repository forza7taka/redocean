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
      isComplete: false
    }
  },
  mounted() {
    this.getLikes()
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
      try {
        let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
          handle: this.handle,
          password: this.password
        })
        this.$store.dispatch('doCreateSession', response.data)
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        console.log(response.data)
        while (!this.isComplete) {
          await this.getFollows(this.handle, this.cursor)
        }
        this.isComplete = true
        while (!this.isComplete) {
          await this.getLikes()
        }
        this.$router.push('/timeline')
      } catch (e) {
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
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getFollows", { params })
        this.cursor = response.data.cursor
        if (response.data.follows.length == 0) {
          this.isComplete = true
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
    async getLikes() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.listRecords', {
          params: {
            repo: this.$store.getters.getDid,
            collection: "app.bsky.feed.like",
            limit: 50
          }
        })
        console.log(response)
        
        for (var i = 0; i < response.data.records.length; i++){
              //response.data.records[i].uid
              response.data.records[i].cid
            
        
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.getRecord', {
            params: {
              repo: this.$store.getters.getDid,
              collection: "app.bsky.feed.post",
              rkey: String(response.data.records[i].cid).substr(-13)
            }
          })
          console.log(response.data)

        
        
        
        
        
        }








      } catch(e) {
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