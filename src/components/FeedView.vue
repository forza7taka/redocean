<template>
  <div v-if="dialog == true">
    <PostView v-model="dialog" :feed="feed" @onClose="onClose" mode="Reply"></PostView>
  </div>

  <v-list>
    <v-list-item v-for="(f, fIndex) in timeline.feed" :key="fIndex">
      <v-row>
        <v-col class="d-flex justify-center align-center">
          <v-card width="400px" class="mx-auto mt-5">
            <div v-if="f.reason && f.reason.by">
              <v-card-subtitle>Repost by {{ f.reason.by.displayName }}(@{{ f.reason.by.handle }})</v-card-subtitle>
            </div>
            <v-card-actions>

              <v-list-item class="w-100">
                <template v-slot:prepend>
                  <div style="padding-right: 10px">
                    <router-link :to="`/profile/${f.post.author.handle}`">
                      <v-avatar color="surface-variant">
                        <v-img cover v-bind:src=f.post.author.avatar alt="avatar"></v-img>
                      </v-avatar>
                    </router-link>
                  </div>
                </template>
                <v-list-item-subtitle>{{ f.post.author.displayName }}</v-list-item-subtitle>
                <v-list-item-subtitle>@{{ f.post.author.handle }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ f.post.record.createdAt }}</v-list-item-subtitle>
              </v-list-item>
            </v-card-actions>

            <v-card-text class="text-pre-wrap">
              <div v-if="f && f.post && f.post.record && f.post.record.text"
                v-html="this.replaceUrls(f.post.record.text)"></div>
            </v-card-text>

            <div v-if="f.post.entities">
              <v-list-item v-for="(e, eIndex) in f.post.entities" :key="eIndex">
                <div v-if="e.type = 'mention'">
                </div>
                <div v-if="e.type = 'hashtag'">
                </div>
                <div v-if="e.type = 'link'">
                  <v-btn href='${e.value}' color="primary">{{ e.value }}</v-btn>
                </div>
              </v-list-item>
            </div>

            <div v-if="f.post.embed && f.post.embed.images">
              <v-card-text>
                <v-list-item v-for="(i, iIndex) in f.post.embed.images" :key="iIndex">
                  <v-row>
                    <v-col>
                      <v-img v-bind:src=i.fullsize alt=""></v-img>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-card-text>
            </div>

            <v-list-item-subtitle>
              <v-btn class="ma-2" variant="text" icon="mdi-comment-outline" @click="dialog = true;
              this.feed = f"></v-btn>{{ f.post.replyCount }}

              <v-btn class="ma-2" variant="text" icon="mdi-repeat"
                @click="repost(f); f.post.repostCount = f.post.repostCount + 1"></v-btn>{{ f.post.repostCount }}

              <v-btn class="ma-2" variant="text" icon="mdi-heart-outline" color="red"
                @click="like(f); f.post.likeCount = f.post.likeCount + 1"></v-btn>{{ f.post.likeCount }}


              <v-menu>
                <!--<template v-if=true v-slot:[`activator${fIndex}`]="{ props }">-->
                <template #activator="{ on }">
                  <v-btn v-bind="on" class="ma-2" variant="text" icon="mdi-dots-vertical" />
                </template>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>
                      トップ
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>





            </v-list-item-subtitle>

            <div v-if="f.reply && f.reply.parent">
              <v-card width="350px" class="mx-auto mt-5">
                <v-card-actions>
                  <v-list-item class="w-100">
                    <template v-slot:prepend>
                      <div style="padding-right: 10px">
                        <router-link :to="`/profile/${f.reply.parent.author.handle}`">
                          <v-avatar color="surface-variant">
                            <v-img cover v-bind:src=f.reply.parent.author.avatar alt="avatar"></v-img>
                          </v-avatar>
                        </router-link>
                      </div>
                    </template>
                    <v-list-item-subtitle>{{ f.reply.parent.author.displayName }}</v-list-item-subtitle>
                    <v-list-item-subtitle>@{{ f.reply.parent.author.handle }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{ f.reply.parent.record.createdAt }}</v-list-item-subtitle>
                  </v-list-item>
                </v-card-actions>
                <v-card-text class="text-pre-wrap">
                  <div v-if="f && f.reply && f.reply.parent && f.reply.parent.record && f.reply.parent.record.text"
                    v-html="this.replaceUrls(f.reply.parent.record.text)"></div>
                </v-card-text>
              </v-card>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script>
import PostView from './PostView.vue'

export default {
  components: {
    PostView
  },
  name: "App",
  data() {
    return {
      menu: false,
      dialog: false,
      parent: {},
      root: {},
      popUpMenus: [{ title: "delete" }]
    };
  },
  props: {
    timeline: {}
  },
  methods: {
    getUri(uri) {
      return Buffer.from(uri).toString('base64')
    },
    async repost(feed) {
      try {
        let subject = { uri: feed.post.uri, cid: feed.post.cid }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          collection: "app.bsky.feed.repost",
          repo: this.$store.getters.getDid,
          record: {
            createdAt: new Date(),
            $type: "app.bsky.feed.repost",
            subject: subject
          }
        })
        console.log(response)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async like(feed) {
      try {
        let subject = { uri: feed.post.uri, cid: feed.post.cid }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          collection: "app.bsky.feed.like",
          repo: this.$store.getters.getDid,
          record: {
            subject: subject,
            createdAt: new Date()
          }
        })
        console.log(response)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    onClose(value) {
      this.dialog = value;
    },
    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    }

  }
}
</script>
