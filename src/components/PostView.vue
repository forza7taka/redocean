<template>
  <template v-if="defProps.post && !isFilter">
    <v-card :class="['mx-auto mt-5', { 'v-card--depth': depth !== 0 }]" variant="flat">
      <div v-if="defProps.reason && defProps.reason.by">
        <v-card-subtitle>Reposted by {{ defProps.reason.by.displayName }}(@{{ defProps.reason.by.handle
        }})</v-card-subtitle>
      </div>
      <div v-if="defProps.parent && defProps.parent.author">
        <v-card-subtitle>Replied to {{ defProps.parent.author.displayName }}(@{{ defProps.parent.author.handle
        }})</v-card-subtitle>
      </div>
      <v-card-actions>
        <PostUserView :author="defProps.post.author" :createdAt="defProps.post.record.createdAt" />
      </v-card-actions>
      <template v-if="warnLabels">
        <v-card-title @click="isWarn = !isWarn">
          [Warning] {{ warnLabels }}
        </v-card-title>
      </template>
      <template v-if="!isWarn">
        <v-card-text class="text-pre-wrap">
          <div v-if="defProps.post && defProps.post.record && defProps.post.record.text">
            {{ defProps.post.record.text }}</div>
        </v-card-text>
        <v-card-text v-if="translateText" class="text-pre-wrap">
          {{ translateText }}
        </v-card-text>
        <div v-for="(facet, facetIndex) in defProps.post.record.facets" :key="facetIndex">
          <div v-for="(feature, featureIndex) in facet.features" :key="featureIndex">
            <v-card-text>
              <a :href="feature.uri">{{ feature.uri }}</a>
            </v-card-text>
          </div>
        </div>
        <v-card-subtitle>
          <v-list-item-subtitle>
            <div v-if="defProps.post.record.via">
              via:{{ defProps.post.record.via }}
            </div>
          </v-list-item-subtitle>
        </v-card-subtitle>

        <div v-if="defProps.post.embed && defProps.post.embed.images">
          <PostImageView :images="defProps.post.embed.images" />
        </div>

        <div v-if="defProps.post.embed && defProps.post.embed.media">
          <PostImageView :images="defProps.post.embed.media.images" />
        </div>

        <!--quoteRepostWithImage S-->
        <div v-if="defProps.post.embed && defProps.post.embed.record">
          <div v-if="defProps.post.embed.$type == 'app.bsky.embed.recordWithMedia#view'">
            <v-card class="mx-auto" variant="outlined" :to="`/thread/${encodeURIComponent(defProps.post.uri)}`">
              <v-card-actions>
                <PostUserView :author="defProps.post.embed.record.record.author"
                  :createdAt="defProps.post.embed.record.record.value.createdAt" />
              </v-card-actions>
              <v-card-text class="text-pre-wrap" :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
                <div
                  v-if="defProps.post.embed && defProps.post.embed.record && defProps.post.embed.record.record && defProps.post.embed.record.record.value">
                  {{ defProps.post.embed.record.record.value.text }}</div>
              </v-card-text>
            </v-card>
          </div>
          <!--quoteRepostWithImage E-->

          <!--quoteRepost S-->
          <div v-if="defProps.post.embed.$type == 'app.bsky.embed.record#view'">
            <v-card class="mx-auto mt-5" variant="outlined"
              :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
              <v-card-actions>
                <PostUserView :author="defProps.post.embed.record.author"
                  :createdAt="defProps.post.embed.record.value.createdAt" />
              </v-card-actions>
              <v-card-text class="text-pre-wrap" :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
                <div v-if="defProps.post.embed && defProps.post.embed.record && defProps.post.embed.record.value">{{
                  defProps.post.embed.record.value.text }}</div>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <!--quoteRepost E-->
      </template>

      <v-list-item-subtitle>
        <v-btn class="ma-2" variant="text" size="32" icon="mdi-comment-outline"
          :to="`/reply/${encodeURIComponent(defProps.post.uri)}`">
        </v-btn>{{ defProps.post.replyCount }}

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" v-if="store.getters.hasRepost(defProps.post.uri)" class="ma-2" variant="text" size="32"
              color="red" icon="mdi-repeat" />
            <v-btn v-bind="props" v-else class="ma-2" variant="text" size="32" icon="mdi-repeat" />
          </template>
          <v-list>
            <v-list-item @click="repost(defProps.post)">
              <v-icon size="24">mdi-repeat</v-icon>Repost
            </v-list-item>
            <v-list-item :to="`/quoteRepost/${encodeURIComponent(defProps.post.uri)}`">
              <v-icon size="24">mdi-comma-circle-outline</v-icon>Quote Repost
            </v-list-item>
          </v-list>
        </v-menu>
        {{ defProps.post.repostCount }}

        <v-btn class=" ma-2" variant="text" size="32" icon="mdi-heart" color="red"
          v-if="store.getters.hasLike(defProps.post.uri)" @click="like(defProps.post)"></v-btn>
        <v-btn class="ma-2" variant="text" size="32" icon="mdi-heart-outline" color="red" v-else
          @click="like(defProps.post)"></v-btn>
        {{ defProps.post.likeCount }}

        <v-btn class=" ma-2" variant="text" size="32" icon="mdi-translate"
          @click="translate(defProps.post.record.text)"></v-btn>

        <v-btn v-if="defProps.root" class="ma-2" variant="text" size="32" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(defProps.root.uri)}`"></v-btn>
        <v-btn v-else class="ma-2" variant="text" size="32" icon="mdi-file-tree-outline"
          :to="`/thread/${encodeURIComponent(defProps.post.uri)}`"></v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" class="ma-2" variant="text" size="32" icon="mdi-dots-vertical" />
          </template>
          <v-list>
            <!-- <v-list-item v-if="defProps.post.author.handle == store.getters.getHandle"
              :to="`/editPost/${encodeURIComponent(defProps.post.uri)}`">
              <v-icon size="24">mdi-square-edit-outline</v-icon>Edit Post
            </v-list-item> -->
            <v-list-item :to="`/reportPost/${encodeURIComponent(defProps.post.uri)}`">
              <v-icon size="24">mdi-alert-circle-outline</v-icon>Report Post
            </v-list-item>
            <v-list-item v-if="defProps.post.author.handle == store.getters.getHandle"
              @click="deletePost(defProps.post.uri)">
              <v-icon size="24">mdi-delete</v-icon>Delete
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item-subtitle>
      <div class="justify-center align-center" v-for="(r, rIndex) in defProps.replies" :key="rIndex">
        <v-divider />
        <PostView :post="r.post" :root="root" :depth="depth + 1" :replies="r.replies"></PostView>
      </div>
    </v-card>
    <v-divider v-if="depth == 0" />
  </template>
</template>

<script setup>
import PostUserView from './PostUserView.vue'
import PostImageView from './PostImageView.vue'
import axios from 'axios'
import { ref, defineProps, defineEmits, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestPost } from "@/common/requestPost";
import { useCatchError } from '@/common/catchError';
import { useStorage } from '@vueuse/core'
import { useSettings } from '@/common/settings'

const defProps = defineProps({
  post: null,
  reason: null,
  root: null,
  parent: null,
  depth: null,
  replies: null,
})

const emit = defineEmits(
  ['deletePost']
)
const store = useStore()
const request = useRequestPost(store)

const settings = ref({
  userID: null,
  translationApiKey: null,
  translationLang: null,
  handed: true,
  users: [{ did: null, server: null, handle: null, avatar: null, color: null, labels: null }]
})
useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

const isWarn = ref(false)
const isFilter = ref(false)
const warnLabels = ref(null)

const translateText = ref(null)

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(store.getters.getDid, store.getters.getHandle)

  isWarn.value = await contains("warn")
  isFilter.value = await contains("filter")
  const value = await getWarnLabels()
  if (value) {
    warnLabels.value = value.join(' ')
  }
});

const contains = async (value) => {
  if (!defProps.post) {
    return false
  }
  if (!defProps.post.labels) {
    return false
  }
  if (!userSettings.value) {
    return false
  }
  if (!userSettings.value.labels) {
    return false
  }
  const labels = new Array()
  for (const index in userSettings.value.labels) {
    if (userSettings.value.labels[index].value != value) {
      continue
    }
    labels.push(userSettings.value.labels[index].id)
  }
  for (const index in defProps.post.labels) {
    const includes = labels.includes(defProps.post.labels[index].val)
    if (includes) {
      return true
    }
  }
  return false
}

const getWarnLabels = async () => {
  if (!defProps.post) {
    return null
  }
  if (!defProps.post.labels) {
    return null
  }
  if (!userSettings.value) {
    return null
  }
  if (!userSettings.value.labels) {
    return null
  }
  let labels = new Array()
  for (const index in userSettings.value.labels) {
    if (userSettings.value.labels[index].value != 'warn') {
      continue
    }
    labels.push(userSettings.value.labels[index].id)
  }
  let warnLabels = new Array()
  for (const index in defProps.post.labels) {
    const includes = labels.includes(defProps.post.labels[index].val)
    if (includes) {
      warnLabels.push(defProps.post.labels[index].val)
    }
  }
  return warnLabels
}

const translate = async (text) => {
  try {
    const params = {
      q: text,
      target: settings.value.translationLang,
      key: settings.value.translationApiKey
    }
    const response = await axios.get('https://translation.googleapis.com/language/translate/v2', { params })
    translateText.value = response.data.data.translations[0].translatedText
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
const deletePost = async (uri) => {
  try {
    await request.post("com.atproto.repo.deleteRecord", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      rkey: String(uri).substr(-13)
    })
    emit('deletePost', uri)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const repost = async (post) => {
  try {
    if (!store.getters.hasRepost(post.uri)) {
      const subject = { uri: post.uri, cid: post.cid }
      const response = await request.post("com.atproto.repo.createRecord", {
        collection: "app.bsky.feed.repost",
        repo: store.getters.getDid,
        record: {
          createdAt: new Date(),
          $type: "app.bsky.feed.repost",
          subject: subject
        }
      })
      post.repostCount = post.repostCount + 1
      store.dispatch('doAddRepost', { key: post.uri, value: response.res.uri });
    } else {
      await request.post("com.atproto.repo.deleteRecord", {
        collection: "app.bsky.feed.repost",
        repo: store.getters.getDid,
        rkey: store.getters.getReposts.get(post.uri).substr(-13)
      })
      post.repostCount = post.repostCount - 1
      store.dispatch('doRemoveRepost', post.uri);
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
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
    const ce = useCatchError()
    ce.catchError(e)
  }
}

</script>
<style scoped>
.v-card--depth {
  margin-left: 5px !important;
  margin-right: 0px !important;
}
</style>
