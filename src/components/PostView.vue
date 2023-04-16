<template>
  <div v-if="dialog == true">
    <PostFormView v-if="root" v-model="dialog" @onClose="onClose" mode="Reply" :root="root" :parent="post">
    </PostFormView>
    <PostFormView v-if="!root" v-model="dialog" @onClose="onClose" mode="Reply" :root="post" :parent="post">
    </PostFormView>
  </div>
  <div v-if="post">
    <v-card :style="{ width: `${400 - this.depth * 30}px` }" class="mx-auto mt-5">
      <div v-if="reason && reason.by">
        <v-card-subtitle>Reposted by {{ reason.by.displayName }}(@{{ reason.by.handle }})</v-card-subtitle>
      </div>
      <div v-if="parent && parent.author">
        <v-card-subtitle>Replied to {{ parent.author.displayName }}(@{{ parent.author.handle
        }})</v-card-subtitle>
      </div>
      <v-card-actions>
        <v-list-item class="w-100">
          <template v-slot:prepend>
            <div style="padding-right: 10px">
              <router-link :to="`/profile/${post.author.handle}`">
                <v-avatar color="surface-variant">
                  <v-img cover v-bind:src=post.author.avatar alt="avatar"></v-img>
                </v-avatar>
              </router-link>
            </div>
          </template>
          <v-list-item-subtitle>{{ post.author.displayName }}</v-list-item-subtitle>
          <v-list-item-subtitle>@{{ post.author.handle }}</v-list-item-subtitle>
          <v-list-item-subtitle>{{ post.record.createdAt }}</v-list-item-subtitle>
        </v-list-item>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <div v-if="post && post.record && post.record.text" v-html="this.replaceUrls(post.record.text)"></div>
      </v-card-text>
      <div v-if="post.embed && post.embed.images">
        <v-card-text>
          <v-list-item v-for="(i, iIndex) in post.embed.images" :key="iIndex">
            <v-row>
              <v-col>
                <v-img v-bind:src=i.fullsize alt=""></v-img>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-text>
      </div>
      <v-list-item-subtitle>
        <v-btn class="ma-2" variant="text" icon="mdi-comment-outline" @click="dialog = true">
        </v-btn>{{ post.replyCount }}

        <v-btn class="ma-2" variant="text" icon="mdi-repeat" @click="repost(post)">
        </v-btn>{{ post.repostCount }}

        <v-btn class=" ma-2" variant="text" icon="mdi-heart" color="red" v-if="this.$store.getters.hasLike(post.uri)"
          @click="like(post)"></v-btn>
        <v-btn class="ma-2" variant="text" icon="mdi-heart-outline" color="red"
          v-if="!this.$store.getters.hasLike(post.uri)" @click="like(post)"></v-btn>
        {{ post.likeCount }}

        <v-btn v-if="root" class="ma-2" variant="text" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(root.uri)}`"></v-btn>
        <v-btn v-if="!root" class="ma-2" variant="text" icon="mdi-file-tree-outline"
            :to="`/thread/${encodeURIComponent(post.uri)}`"></v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="ma-2" variant="text" icon="mdi-dots-vertical" />
          </template>
          <v-list v-if="post && post.author.handle == this.$store.getters.getHandle">
            <v-list-item @click="deletePost(post.uri)">
              <v-icon small>mdi-delete</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-subtitle>
      <v-list>
        <v-list-item v-for="(r, rIndex) in replies" :key="rIndex">
          <v-row>
            <v-col class="d-flex justify-center align-center">
              <PostView :post="r.post" :root="root" :depth="depth + 1" :replies="r.replies"></PostView>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>


    </v-card>
  </div>
</template>

<script >
import PostFormView from "./PostFormView.vue"
export default {
  name: 'App',
  components: {
    PostFormView
  },
  data() {
    return {
      dialog: false,
    };
  },
  props: {
    post: null,
    reason: null,
    root: null,
    parent: null,
    depth: null,
    replies: null
  },
  methods: {
    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    },
    async deletePost(uri) {
      console.log(uri)
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.deleteRecor", {
          collection: "app.bsky.feed.post",
          repo: this.$store.getters.getDid,
          rkey: String(uri).substr(-13)
        })
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async repost(post) {
      try {
        let subject = { uri: post.uri, cid: post.cid }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.createRecord", {
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
    async like(post) {
      try {
        if (!this.$store.getters.hasLike(post.uri)) {
          let subject = { uri: post.uri, cid: post.cid }
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          let response = await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.createRecord", {
            collection: "app.bsky.feed.like",
            repo: this.$store.getters.getDid,
            record: {
              subject: subject,
              createdAt: new Date()
            }
          })
          post.likeCount = post.likeCount + 1
          // for (let i = 0; i < timeline.feed; i++) {
          //   if (this.timeline.feed[i].post.uri = feed.post.uri) {
          //     this.timeline.feed[i].post.likeCount = this.timeline.feed[i].post.likeCount + 1
          //   }
          // }
          console.log(response.data.uri)
          this.$store.dispatch('doAddLike', { key: post.uri, value: response.data.uri });
        } else {
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.deleteRecor", {
            collection: "app.bsky.feed.like",
            repo: this.$store.getters.getDid,
            rkey: this.$store.getters.getLikes.get(post.uri).substr(-13)
          })
          post.likeCount = post.likeCount - 1
          // for (let i = 0; i < timeline.feed; i++) {
          //   if (this.timeline.feed[i].post.uri = feed.post.uri) {
          //     this.timeline.feed[i].post.likeCount = this.timeline.feed[i].post.likeCount - 1
          //   }
          // }
          this.$store.dispatch('doRemoveLike', post.uri);
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
    onClose(value) {
      this.dialog = value;
    },
  }
};
</script>
