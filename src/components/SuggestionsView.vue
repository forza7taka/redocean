<template>
  <div v-scroll="onScroll">
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
    this.getSuggestions(this.$route.params.handle, this.cursor)
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
        this.getSuggestions(this.$route.params.handle, this.cursor)
      }
    },
    async getSuggestions(handle, cursor) {
      let params = {}
      if (!cursor) {
        params = {user: handle}
      } else {
        params = {user: handle, before: cursor}
      } 
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      await this.axios.post("app.bsky.actor.getSuggestions", {params})
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