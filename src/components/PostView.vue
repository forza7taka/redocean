<template>
  <div v-if="defProps.post">
    <v-card class="mx-auto mt-5">
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
          <v-list-item-subtitle>{{ convertDate(defProps.post.record.createdAt) }}</v-list-item-subtitle>
        </v-list-item>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <div v-if="defProps.post && defProps.post.record && defProps.post.record.text">
          {{ defProps.post.record.text }}</div>
      </v-card-text>
      <div v-if="translateText">
        <v-card-text class="text-pre-wrap">
          {{ translateText }}
        </v-card-text>
      </div>
      <div v-for="(facet, facetIndex) in defProps.post.record.facets" :key="facetIndex">
        <div v-for="(feature, featureIndex) in facet.features" :key="featureIndex">
          <v-list-item-subtitle>
          <a :href="feature.uri">{{ feature.uri }}</a>
        </v-list-item-subtitle>
        </div>
      </div>

      <div v-if="defProps.post.embed && defProps.post.embed.images">
        <v-card-text>
          <v-list-item v-for="(i, iIndex) in defProps.post.embed.images" :key="iIndex">
            <v-row>
              <v-col>
                <v-img v-bind:src=i.fullsize v-bind:lazy-src=i.thumb class="rounded-xl" alt=""></v-img>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-text>
      </div>

      <div v-if="defProps.post.embed && defProps.post.embed.media">
        <v-card-text>
          <v-list-item v-for="(i, iIndex) in defProps.post.embed.media.images" :key="iIndex">
            <v-row>
              <v-col>
                <v-img v-bind:src=i.fullsize v-bind:lazy-src=i.thumb class="rounded-xl" alt=""></v-img>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-text>
      </div>

      <!--quoteRepostWithImage S-->
      <div v-if="defProps.post.embed && defProps.post.embed.record">
        <div v-if="defProps.post.embed.$type == 'app.bsky.embed.recordWithMedia#view'">
          <v-card class="mx-auto" variant="outlined" :to="`/thread/${encodeURIComponent(defProps.post.uri)}`">
            <v-card-actions>
              <v-list-item class="w-100">
                <template v-slot:prepend>
                  <div style="padding-right: 10px">
                    <router-link :to="`/profile/${defProps.post.embed.record.record.author.handle}`">
                      <v-avatar color="surface-variant">
                        <v-img cover v-bind:src=defProps.post.embed.record.record.author.avatar alt="avatar"></v-img>
                      </v-avatar>
                    </router-link>
                  </div>
                </template>
                <v-list-item-subtitle>{{ defProps.post.embed.record.record.author.displayName }}</v-list-item-subtitle>
                <v-list-item-subtitle>@{{ defProps.post.embed.record.record.author.handle }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ defProps.post.embed.record.record.value.createdAt }}</v-list-item-subtitle>
              </v-list-item>
            </v-card-actions>
            <v-card-text class="text-pre-wrap">
              <div
                v-if="defProps.post.embed && defProps.post.embed.record && defProps.post.embed.record.record && defProps.post.embed.record.record.value">
                {{ defProps.post.embed.record.record.value.text }}</div>
            </v-card-text>
          </v-card>
        </div>
        <!--quoteRepostWithImage E-->

        <!--quoteRepost S-->
        <div v-if="defProps.post.embed.$type == 'app.bsky.embed.record#view'">
          <v-card class="mx-auto mt-5" variant="outlined" :to="`/thread/${encodeURIComponent(defProps.post.embed.record.uri)}`">
            <v-card-actions>
              <v-list-item class="w-100">
                <template v-slot:prepend>
                  <div style="padding-right: 10px">
                    <router-link :to="`/profile/${defProps.post.embed.record.author.handle}`">
                      <v-avatar color="surface-variant">
                        <v-img cover v-bind:src=defProps.post.embed.record.author.avatar alt="avatar"></v-img>
                      </v-avatar>
                    </router-link>
                  </div>
                </template>
                <v-list-item-subtitle>{{ defProps.post.embed.record.author.displayName }}</v-list-item-subtitle>
                <v-list-item-subtitle>@{{ defProps.post.embed.record.author.handle }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ defProps.post.embed.record.value.createdAt }}</v-list-item-subtitle>
              </v-list-item>
            </v-card-actions>
            <v-card-text class="text-pre-wrap">
              <div v-if="defProps.post.embed && defProps.post.embed.record && defProps.post.embed.record.value">{{
                defProps.post.embed.record.value.text }}</div>
            </v-card-text>
          </v-card>
        </div>
      </div>
      <!--quoteRepost E-->
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
      <v-list-item-subtitle>{{ defProps.post.record.via }}</v-list-item-subtitle>

      <v-list>
        <v-list-item v-for="(r, rIndex) in defProps.replies" :key="rIndex">
          <v-row>
            <v-col class="justify-center align-center">
              <PostView :post="r.post" :root="root" :depth="depth + 1" :replies="r.replies"></PostView>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, defineProps } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestPost } from "@/common/requestPost";
import { useDate } from "@/common/date";

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
const { convertDate } = useDate()
const translateText = ref(null)

const translate = async (text) => {
  const params = {
    q: text,
    target: 'ja',
    key: store.getters.getCloudTranslationApiKey
  }
  const response = await axios.get('https://translation.googleapis.com/language/translate/v2', { params })
  translateText.value = response.data.data.translations[0].translatedText
}

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

</script>
<style scoped>
.v-card {
  margin-right: v-bind('depth === 0 ? "5px" : "0px"');
}
</style>
