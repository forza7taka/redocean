<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        Notifications
      </v-card-title>
    </v-card>
  
    <v-list v-if="notifications">
      <v-list-item v-for="(n, nIndex) in notifications" :key="nIndex">
        <v-card width="400px" class="mx-auto mt-5">
          <v-card-text>
            <v-icon v-if="!n.isRead" color="red">mdi-circle</v-icon>
            <v-icon v-if="n.reason == 'follow'">mdi-account-check</v-icon>
            <v-icon v-if="n.reason == 'repost'">mdi-repeat</v-icon>
            <v-icon v-if="n.reason == 'like'" color="red">mdi-heart-outline</v-icon>
            by @{{ n.author.handle }}
                  <router-link :to="`/profile/${n.author.handle}`">
                    <v-avatar size=20 color="surface-variant" small>
                      <v-img cover v-bind:src=n.author.avatar alt="avatar"></v-img>
                    </v-avatar>
                  </router-link>
                  {{ n.author.displayName }} 
          </v-card-text>
            <v-card v-if="this.posts.get(n.reasonSubject)">
                <v-card-subtitle>{{ this.posts.get(n.reasonSubject).value.createdAt }}</v-card-subtitle>
                <v-card-text class="text-pre-wrap">
                  {{ this.posts.get(n.reasonSubject).value.text }}
                </v-card-text>
            </v-card>          
        </v-card>
      </v-list-item>
    </v-list>

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
import InfiniteLoading from 'v3-infinite-loading'

export default {
  components: {
    InfiniteLoading
  },
  data() {
    return {
      complated: false,
      notifications: [],
      cursor: null,
      posts: new Map()
    }
  },
  async beforeMount() {
    await this.getNotifications()
    await this.updateSeen()
    await this.getPosts(this.notifications)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        $state.loaded()
        await this.getNotifications(this.cursor)
        await this.getPost(this.notifications)
      }
    },
    async updateSeen() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        await this.axios.post("https://bsky.social/xrpc/app.bsky.notification.updateSeen", { seenAt: new Date})
       } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getNotifications(cursor) {
      let params = {}
      if (!cursor) {
        params = { }
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.notification.listNotifications", { params })
        this.cursor = response.data.cursor
        if (response.data.notifications.length == 0) {
          this.complated = true
        }
        this.notifications = this.notifications.concat(response.data.notifications)
        console.log(response.data)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getPosts(notifications) {   
      try {

        for (const n of notifications) {
          if (n.reason == "follow") {
            continue
          }
          if (n.reasonSubject in this.posts) {
            continue
          }
          let params = {
            repo: this.$store.getters.getHandle,
            collection: "app.bsky.feed.post",
            rkey: String(n.reasonSubject).substr(-13)
          }
          try {
            this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
            let response = await this.axios.get("https://bsky.social/xrpc/com.atproto.repo.getRecord", { params: params })
            this.posts.set(n.reasonSubject, response.data)
            console.log(response.data.value)
            console.log(this.posts.get(n.reasonSubject))
          } catch (e) {
            if (e.response && e.response.status === 400) {
              continue
            }
            throw e
          }
        }
      } catch (e) {
        console.log(e)
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