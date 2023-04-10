<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-title>
        Likes
      </v-card-title>
    </v-card>

    <v-list v-if="this.timeline.feed">
      <v-list-item v-for="(f, fIndex) in timeline.feed" :key="fIndex">
        <v-card width="400px" class="mx-auto mt-5">
          <v-card-text>

            <v-card-actions>

              <v-list-item class="w-100" v-if="authors.get(String(f.uri).substr(5, 32))">
                <template v-slot:prepend>
                  <div style="padding-right: 10px">
                    <router-link :to="`/profile/${authors.get(String(f.uri).substr(5, 32)).handle}`">
                      <v-avatar color="surface-variant">
                        <v-img cover v-bind:src='authors.get(String(f.uri).substr(5, 32)).avatar' alt="avatar"></v-img>
                      </v-avatar>
                    </router-link>
                  </div>
                </template>
                <v-list-item-subtitle>{{ authors.get(String(f.uri).substr(5, 32)).displayName }}</v-list-item-subtitle>
                <v-list-item-subtitle>@{{ authors.get(String(f.uri).substr(5, 32)).handle }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ f.value.createdAt }}</v-list-item-subtitle>
              </v-list-item>
            </v-card-actions>
          </v-card-text>

          <v-card-subtitle></v-card-subtitle>
          <v-card-text class="text-pre-wrap">
            {{ f.value.text }}
          </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>

    <infinite-loading @infinite="infiniteHandler" :firstload="false">
      <template #spinner>
        <span>loading...</span>
      </template>
      <template #complete>
        <span>No more data found!</span>
      </template>
    </infinite-loading>
  </div>
</template>

<script >
import InfiniteLoading from 'v3-infinite-loading'
export default {
  components: {
    InfiniteLoading
  },
  name: 'App',
  data() {
    return {
      complated: false,
      timeline: { feed: [] },
      cursor: null,
      likes: [],
      authors: new Map()
    };
  },
  watch: {
    likes: {
      handler(nv) {
        this.getPosts(nv)
        this.getAuthors(nv)
      },
      deep: true // 配列の要素まで深く監視する
    },
  },
  async beforeMount() {
    await this.getLikes(this.cursor)
  },
  methods: {
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        await this.getLikes(this.cursor)
        $state.loaded()
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
        let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.listRecords', {
          params
        })

        this.likes = this.likes.concat(response.data.records)
        this.cursor = response.data.cursor
        if (response.data.records.length == 0) {
          this.isComplete = true
          return
        }
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getPosts(likes) {
      try {
        for (var i = 0; i < likes.length; i++) {
          try {
            this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
            let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.getRecord', {
              params: {
                repo: String(likes[i].value.subject.uri).substr(5, 32),
                collection: "app.bsky.feed.post",
                rkey: String(likes[i].value.subject.uri).substr(-13)
              }
            })
            console.log(response.data)
            this.timeline.feed = this.timeline.feed.concat(response.data)
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
    },
    async getAuthors(likes) {
      try {
        for (var i = 0; i < likes.length; i++) {
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
            params: {
              actor: String(likes[i].value.subject.uri).substr(5, 32)
            }
          })
          this.authors.set(String(likes[i].value.subject.uri).substr(5, 32), response.data)
          console.log(response.data)
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
};
</script>