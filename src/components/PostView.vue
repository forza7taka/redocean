<template>
  <template v-if="defProps.post && !isFilter">
    <v-card :class="['mx-auto mt-5', { 'v-card--depth': depth !== 0 }]" variant="flat">
      <template v-if="defProps.reason && defProps.reason.by">
        <v-card-subtitle>{{ $t('post.repostedBy') }} {{ defProps.reason.by.displayName }}(@{{ defProps.reason.by.handle
        }})</v-card-subtitle>
      </template>
      <template v-if="defProps.parent && defProps.parent.author">
        <v-card-subtitle>{{ $t('post.repliedTo') }} {{ defProps.parent.author.displayName }}(@{{
          defProps.parent.author.handle
        }})</v-card-subtitle>
      </template>
      <v-card-actions>
        <PostUserView :author="defProps.post.author" :createdAt="defProps.post.record.createdAt" />
      </v-card-actions>
      <template v-if="warnLabels">
        <v-card-title @click="isWarn = !isWarn">
          [{{ $t('post.warn') }}] {{ warnLabels }}
        </v-card-title>
      </template>
      <template v-if="!isWarn">
        <template v-if="defProps.post && defProps.post.record && defProps.post.record.text">
          <template v-if="isMuteWord">
            <v-card-title @click="visivleMuteWord = !visivleMuteWord">
              [{{ $t("post.containsMuteWords") }}]
            </v-card-title>
          </template>
          <template v-if="!visivleMuteWord">
            <v-card-text class="text-pre-wrap">
              {{ defProps.post.record.text }}
            </v-card-text>
            <v-card-text v-if="translateText" class="text-pre-wrap">
              {{ translateText }}
            </v-card-text>
          </template>
        </template>
        <div v-for="(facet, facetIndex) in defProps.post.record.facets" :key="facetIndex">
          <div v-for="(feature, featureIndex) in facet.features" :key="featureIndex">
            <v-card-text>
              <a :href="feature.uri">{{ feature.uri }}</a>
            </v-card-text>
          </div>
        </div>
        <v-card-subtitle>
          <v-list-item-subtitle>
            <template v-if="defProps.post.record.via">
              via:{{ defProps.post.record.via }}
            </template>
          </v-list-item-subtitle>
        </v-card-subtitle>

        <template v-if="defProps.post.embed && defProps.post.embed.images">
          <PostImageView :images="defProps.post.embed.images" />
        </template>

        <template v-if="defProps.post.embed && defProps.post.embed.media">
          <PostImageView :images="defProps.post.embed.media.images" />
        </template>

        <template v-if="defProps.post.embed && defProps.post.embed.external">
          <template v-if="defProps.post.embed.$type == 'app.bsky.embed.external#view'">

            <a class="link" :href="defProps.post.embed.external.uri">
              <v-card class="mx-auto" variant="outlined">
                <v-card-text class="text-pre-wrap">

                  <v-img v-bind:src=defProps.post.embed.external.thumb class="rounded-xl" alt=""></v-img>
                </v-card-text>
                <v-card-text class="text-pre-wrap">
                  <template v-if="defProps.post.embed.external">
                    {{ defProps.post.embed.external.title }}</template>
                </v-card-text>
                <v-card-text class="text-pre-wrap">
                  <template v-if="defProps.post.embed.external">
                    {{ defProps.post.embed.external.description }}</template>
                </v-card-text>
              </v-card>
            </a>
          </template>
        </template>

        <!--quoteRepostWithImage S-->
        <template v-if="defProps.post.embed && defProps.post.embed.record">
          <template v-if="defProps.post.embed.$type == 'app.bsky.embed.recordWithMedia#view'">
            <v-card class="mx-auto" variant="outlined" :to="`/thread/${encodeURIComponent(defProps.post.uri)}`">
              <v-card-actions>
                <PostUserView :author="defProps.post.embed.record.record.author"
                  :createdAt="defProps.post.embed.record.record.value.createdAt" />
              </v-card-actions>
              <v-card-text class="text-pre-wrap" :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
                <template v-if="isMuteWordQuote">
                  <v-card-title @click="visivleMuteWordQuote = !visivleMuteWordQuote">
                    [{{ $t("post.containsMuteWords") }}]
                  </v-card-title>
                </template>
                <template v-if="!visivleMuteWordQuote">
                  <template
                    v-if="defProps.post.embed && defProps.post.embed.record && defProps.post.embed.record.record && defProps.post.embed.record.record.value">
                    {{ defProps.post.embed.record.record.value.text }}</template>
                </template>
              </v-card-text>
            </v-card>
          </template>
          <!--quoteRepostWithImage E-->

          <!--quoteRepost S-->
          <template v-if="defProps.post.embed && defProps.post.embed.record">
            <template v-if="defProps.post.embed.$type == 'app.bsky.embed.record#view'">
              <template v-if="defProps.post.embed.record.$type == 'app.bsky.feed.defs#generatorView'">
                <v-card class="mx-auto mt-5" variant="outlined">
                  <v-card-text class="text-pre-wrap">
                    <template v-if="defProps.post.embed && defProps.post.embed.record">
                      <div>{{ defProps.post.embed.record.displayName }}</div>
                    </template>
                    <template v-if="defProps.post.embed && defProps.post.embed.record">
                      <div>{{ defProps.post.embed.record.description }}</div>
                    </template>
                  </v-card-text>
                </v-card>
              </template>
              <template v-else>
                <v-card class="mx-auto mt-5" variant="outlined"
                  :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
                  <v-card-actions>
                    <PostUserView :author="defProps.post.embed.record.author"
                      :indexedAt="defProps.post.embed.record.indexedAt" />
                  </v-card-actions>
                  <template v-if="isMuteWordQuote">
                    <v-card-title @click="visivleMuteWordQuote = !visivleMuteWordQuote">
                      [{{ $t("post.containsMuteWords") }}]
                    </v-card-title>
                  </template>
                  <template v-if="!visivleMuteWordQuote">
                    <v-card-text class="text-pre-wrap"
                      :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
                      <div v-if="defProps.post.embed && defProps.post.embed.record">{{
                        defProps.post.embed.record.value.text }}</div>
                    </v-card-text>
                  </template>
                </v-card>
              </template>
            </template>
          </template>
        </template>
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
              <v-icon size="24">mdi-repeat</v-icon>{{ $t('post.repost') }}
            </v-list-item>
            <v-list-item :to="`/quoteRepost/${encodeURIComponent(defProps.post.uri)}`">
              <v-icon size="24">mdi-comma-circle-outline</v-icon>{{ $t('post.quoteRepost') }}
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
            <v-list-item :to="`/reportPost/${encodeURIComponent(defProps.post.uri)}`">
              <v-icon size="24">mdi-alert-circle-outline</v-icon>{{ $t('post.reportPost') }}
            </v-list-item>
            <v-list-item v-if="defProps.post.author.handle == store.getters.getHandle"
              @click="deletePost(defProps.post.uri)">
              <v-icon size="24">mdi-delete</v-icon>{{ $t('post.delete') }}
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
import { Setting } from '@/common/setting'

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
const settings = ref(new Setting())

useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

const isWarn = ref(false)
const isFilter = ref(false)
const warnLabels = ref(null)
const isMuteWord = ref(false)
const visivleMuteWord = ref(false)
const isMuteWordQuote = ref(false)
const visivleMuteWordQuote = ref(false)

const translateText = ref(null)

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(store.getters.getDid, store.getters.getHandle)

  isWarn.value = await contains("warn")
  isFilter.value = await contains("filter")
  const value = await getWarnLabels()
  if (value) {
    warnLabels.value = value.join(' ')
  }
  isMuteWord.value = await containsMuteWords(defProps.post.record.text)
  visivleMuteWord.value = isMuteWord.value
  if (defProps.post && defProps.post.embed && defProps.post.embed.record) {
    if (defProps.post.embed.record.value) {
      isMuteWordQuote.value = await containsMuteWords(defProps.post.embed.record.value.text)
      visivleMuteWordQuote.value = isMuteWordQuote.value
    }
    if (defProps.post.embed.record.record && defProps.post.embed.record.record.value) {
      isMuteWordQuote.value = await containsMuteWords(defProps.post.embed.record.record.value.text)
      visivleMuteWordQuote.value = isMuteWordQuote.value
    }
  }
});

const containsMuteWords = async (value) => {
  if (!userSettings.value) {
    return false
  }
  if (!userSettings.value.muteWords) {
    return false
  }
  if (userSettings.value.muteWords.length == 0) {
    return false
  }
  for (let i = 0; i < userSettings.value.muteWords.length; i++) {
    const muteWord = userSettings.value.muteWords[i]
    if (!muteWord) {
      continue
    }
    if (!muteWord.value) {
      continue
    }
    if (muteWord.value == "") {
      continue
    }
    if ((new RegExp(muteWord.value)).test(value)) {
      return true
    }
  }
  return false
}


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
