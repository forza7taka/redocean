<template>
  <div v-scroll="onScroll">

    <v-card width="400px" class="mx-auto mt-5">
        <v-card-title>
          <router-link :to="`/profile/${this.$route.params.handle}`">
          <v-avatar color="surface-variant">
          <v-img cover v-bind:src=subject.avatar alt="avatar"></v-img>
          </v-avatar>
          </router-link>
          @{{subject.handle}} follows
        </v-card-title>
      </v-card>
    <div v-if="complated == true">
      <UsersView :users="follows"></UsersView>
    </div>
  </div>
</template>

<script>
import UsersView from './UsersView.vue'
export default {
  components: {
    UsersView
  },
  data() {
    return {
      complated: false,
      follows: [],
      cursor: null,
      isComplete: false,
      subject: {}
    }
  },
  beforeMount() {
    this.getFollows(this.$route.params.handle, this.cursor)
  },
  methods :{
    onScroll() {
      if (this.isComplete) {
        return;
      }
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop <= clientHeight) {
        this.getFollows(this.$route.params.handle, this.cursor)
      }
    },
    async getFollows(handle, cursor) {
      let params = {}
      if (!cursor) {
        params = {user: handle}
      } else {
        params = {user: handle, before: cursor}
      } 
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getFollows", {params})
      .then(response => {
        console.log(response.data)
        this.cursor = response.data.cursor
        if (response.data.follows.length == 0) {
          this.isComplete = true
        }
        this.follows = this.follows.concat(response.data.follows)
        this.subject = response.data.subject
        this.complated = true
      })
      .catch(err => {
        console.error(err)
      })
    }
  }
}
</script>