<template>
  <div v-if="visible == true">
    <PostFormView v-if="defProps.root" v-model="visible" @onClose="onClose" mode="Reply" :root="defProps.root"
      :parent="defProps.post">
    </PostFormView>
    <PostFormView v-if="!defProps.root" v-model="visible" @onClose="onClose" mode="Reply" :root="defProps.post"
      :parent="defProps.post">
    </PostFormView>
  </div>
  <div v-if="defProps.post">
    <v-card :style="{ width: `${400 - depth * 30}px` }" class="mx-auto mt-5">
      <div v-if="defProps.reason && defProps.reason.by">
        <v-card-subtitle>Reposted by {{ defProps.reason.by.displayName }}(@{{ defProps.reason.by.handle
        }})</v-card-subtitle>
      </div>
      <div v-if="defProps.parent && defProps.parent.author">
        <v-card-subtitle>Replied to {{ defProps.parent.author.displayName }}(@{{ defProps.parent.author.handle
        }})</v-card-subtitle>
      </div>
      <v-card-actions>
        <v-list-item class="w-100">
          <template v-slot:prepend>
            <div style="padding-right: 10px">
              <router-link :to="`/profile/${defProps.post.author.handle}`">
                <v-avatar color="surface-variant">
                  <v-img cover v-bind:src=defProps.post.author.avatar alt="avatar"></v-img>
                </v-avatar>
              </router-link>
            </div>
          </template>
          <v-list-item-subtitle>{{ defProps.post.author.displayName }}</v-list-item-subtitle>
          <v-list-item-subtitle>@{{ defProps.post.author.handle }}</v-list-item-subtitle>
          <v-list-item-subtitle>{{ defProps.post.record.createdAt }}</v-list-item-subtitle>
        </v-list-item>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <div v-if="defProps.post && defProps.post.record && defProps.post.record.text">
          {{ defProps.post.record.text }}</div>
      </v-card-text>
      <v-card-actions>
        <v-list-item v-for="(facet, facetIndex) in defProps.post.record.facets" :key="facetIndex">
          <div v-if="facet.features">
            <v-list-item v-for="(feature, featureIndex) in facet.features" :key="featureIndex">
              <a :href="feature.uri">{{ feature.uri }}</a>
            </v-list-item>
          </div>
        </v-list-item>
      </v-card-actions>
      <div v-if="defProps.post.embed && defProps.post.embed.images">
        <v-card-text>
          <v-list-item v-for="(i, iIndex) in defProps.post.embed.images" :key="iIndex">
            <v-row>
              <v-col>
                <v-img v-bind:src=i.fullsize v-bind:lazy-src=i.thumb alt=""></v-img>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-text>
      </div>
      <v-list-item-subtitle>
        <v-btn class="ma-2" variant="text" icon="mdi-comment-outline" @click="visible = true">
        </v-btn>{{ defProps.post.replyCount }}

        <v-btn class="ma-2" variant="text" icon="mdi-repeat" @click="repost(defProps.post)">
        </v-btn>{{ defProps.post.repostCount }}

        <v-btn class=" ma-2" variant="text" icon="mdi-heart" color="red" v-if="store.getters.hasLike(defProps.post.uri)"
          @click="like(defProps.post)"></v-btn>
        <v-btn class="ma-2" variant="text" icon="mdi-heart-outline" color="red"
          v-if="!store.getters.hasLike(defProps.post.uri)" @click="like(defProps.post)"></v-btn>
        {{ defProps.post.likeCount }}

        <v-btn v-if="defProps.root" class="ma-2" variant="text" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(defProps.root.uri)}`"></v-btn>
        <v-btn v-if="!defProps.root" class="ma-2" variant="text" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(defProps.post.uri)}`"></v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="ma-2" variant="text" icon="mdi-dots-vertical" />
          </template>
          <v-list v-if="defProps.post.author.handle == store.getters.getHandle">
            <v-list-item @click="deletePost(defProps.post.uri)">
              <v-icon small>mdi-delete</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>

      </v-list-item-subtitle>
      <v-list>
        <v-list-item v-for="(r, rIndex) in defProps.replies" :key="rIndex">
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
//import { useReplaceUrls } from '../common/replaceUrls.js'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestPost } from "@/common/requestPost";

//const { replaceUrls } = useReplaceUrls()

const defProps = defineProps({
  post: null,
  reason: null,
  root: null,
  parent: null,
  depth: null,
  replies: null
})
const store = useStore()

const request = useRequestPost(store)

const visible = ref(false)

const deletePost = async (uri) => {
  try {
    await request.post("com.atproto.repo.deleteRecord", {
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
    await request.post("com.atproto.repo.createRecord", {
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
      const response = await request.post("com.atproto.repo.createRecord", {
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
      await request.post("com.atproto.repo.deleteRecord", {
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
