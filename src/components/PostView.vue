<template>
  <div v-if="visible == true">
    <PostFormView v-if="props.root" v-model="visible" @onClose="onClose" mode="Reply" :root="props.root"
      :parent="props.post">
    </PostFormView>
    <PostFormView v-if="!props.root" v-model="visible" @onClose="onClose" mode="Reply" :root="props.post"
      :parent="props.post">
    </PostFormView>
  </div>
  <div v-if="props.post">
    <v-card :style="{ width: `${400 - this.depth * 30}px` }" class="mx-auto mt-5">
      <div v-if="props.reason && props.reason.by">
        <v-card-subtitle>Reposted by {{ props.reason.by.displayName }}(@{{ props.reason.by.handle }})</v-card-subtitle>
      </div>
      <div v-if="props.parent && props.parent.author">
        <v-card-subtitle>Replied to {{ props.parent.author.displayName }}(@{{ props.parent.author.handle
        }})</v-card-subtitle>
      </div>
      <v-card-actions>
        <v-list-item class="w-100">
          <template v-slot:prepend>
            <div style="padding-right: 10px">
              <router-link :to="`/profile/${props.post.author.handle}`">
                <v-avatar color="surface-variant">
                  <v-img cover v-bind:src=props.post.author.avatar alt="avatar"></v-img>
                </v-avatar>
              </router-link>
            </div>
          </template>
          <v-list-item-subtitle>{{ props.post.author.displayName }}</v-list-item-subtitle>
          <v-list-item-subtitle>@{{ props.post.author.handle }}</v-list-item-subtitle>
          <v-list-item-subtitle>{{ props.post.record.createdAt }}</v-list-item-subtitle>
        </v-list-item>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <div v-if="props.post && props.post.record && props.post.record.text"
          v-html="replaceUrls(props.post.record.text)"></div>
      </v-card-text>
      <div v-if="props.post.embed && props.post.embed.images">
        <v-card-text>
          <v-list-item v-for="(i, iIndex) in props.post.embed.images" :key="iIndex">
            <v-row>
              <v-col>
                <v-img v-bind:src=i.fullsize v-bind:lazy-src = i.thumb alt=""></v-img>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-text>
      </div>
      <v-list-item-subtitle>
        <v-btn class="ma-2" variant="text" icon="mdi-comment-outline" @click="dialog = true">
        </v-btn>{{ props.post.replyCount }}

        <v-btn class="ma-2" variant="text" icon="mdi-repeat" @click="repost(props.post)">
        </v-btn>{{ props.post.repostCount }}

        <v-btn class=" ma-2" variant="text" icon="mdi-heart" color="red" v-if="store.getters.hasLike(props.post.uri)"
          @click="like(props.post)"></v-btn>
        <v-btn class="ma-2" variant="text" icon="mdi-heart-outline" color="red"
          v-if="!store.getters.hasLike(props.post.uri)" @click="like(props.post)"></v-btn>
        {{ props.post.likeCount }}

        <v-btn v-if="props.root" class="ma-2" variant="text" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(props.root.uri)}`"></v-btn>
        <v-btn v-if="!props.root" class="ma-2" variant="text" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(props.post.uri)}`"></v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ menu }">
            <v-btn v-bind="menu" class="ma-2" variant="text" icon="mdi-dots-vertical" />
          </template>
          <v-list v-if="props.post && props.post.author.handle == store.getters.getHandle">
            <v-list-item @click="deletePost(props.post.uri)">
              <v-icon small>mdi-delete</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-subtitle>
      <v-list>
        <v-list-item v-for="(r, rIndex) in props.replies" :key="rIndex">
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

<script setup>
import PostFormView from "./PostFormView.vue"
import { ref, defineProps } from 'vue'
import { useReplaceUrls } from '../common/replaceUrls.js'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestPost } from "@/common/requestPost";

const { replaceUrls } = useReplaceUrls()

const props = defineProps({
  post: null,
  reason: null,
  root: null,
  parent: null,
  depth: null,
  replies: null
})

const request = useRequestPost()
const store = useStore()

const visible = ref(false)

const deletePost = async (uri) => {
  try {
    await request.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.deleteRecor", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      rkey: String(uri).substr(-13)
    })
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}

const repost = async (post) => {
  try {
    const subject = { uri: post.uri, cid: post.cid }
    await request.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.createRecord", {
      collection: "app.bsky.feed.repost",
      repo: store.getters.getDid,
      record: {
        createdAt: new Date(),
        $type: "app.bsky.feed.repost",
        subject: subject
      }
    })
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}

const like = async (post) => {
  try {
    if (!store.getters.hasLike(post.uri)) {
      const subject = { uri: post.uri, cid: post.cid }
      const response = await request.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.createRecord", {
        collection: "app.bsky.feed.like",
        repo: store.getters.getDid,
        record: {
          subject: subject,
          createdAt: new Date()
        }
      })
      post.likeCount = post.likeCount + 1
      store.dispatch('doAddLike', { key: post.uri, value: response.res.uri });
    } else {
      await this.axios.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.deleteRecor", {
        collection: "app.bsky.feed.like",
        repo: store.getters.getDid,
        rkey: store.getters.getLikes.get(post.uri).substr(-13)
      })
      post.likeCount = post.likeCount - 1
      store.dispatch('doRemoveLike', post.uri);
    }
  } catch (e) {
    const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}
const onClose = async (value) => {
  visible.value = value;
}
</script>
