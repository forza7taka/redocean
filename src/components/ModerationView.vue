<template>
  <v-card class="mx-auto mt-5">
    <v-card-title>
      <div v-if="mode == 'post'">Report Post</div>
      <div v-if="mode == 'user'">Report User</div>
    </v-card-title>
  </v-card>
  <v-card v-if="post" class="mx-auto mt-5">
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
        <v-list-item-subtitle>{{ convertDate(post.record.createdAt) }}</v-list-item-subtitle>
      </v-list-item>
    </v-card-actions>
    <v-card-text>
      <div v-if="post && post.record && post.record.text">
        {{ post.record.text }}</div>
    </v-card-text>
    <div v-if="post.embed && post.embed.images">
      <v-card-text>
        <v-list-item v-for="(i, iIndex) in post.embed.images" :key="iIndex">
          <v-row>
            <v-col>
              <v-img v-bind:src=i.fullsize v-bind:lazy-src=i.thumb class="rounded-xl" alt=""></v-img>
            </v-col>
          </v-row>
        </v-list-item>
      </v-card-text>
    </div>
  </v-card>

  <v-card v-if="profile" class="mx-auto mt-5" elevation="20">
    <v-card-actions>
      <v-list-item class="w-100">
        <template v-slot:prepend>
          <div style="padding-right: 10px">
            <router-link :to="`/profile/${profile.handle}`">
              <v-avatar color="surface-variant">
                <v-img cover v-bind:src=profile.avatar alt="avatar"></v-img>
              </v-avatar>
            </router-link>
          </div>
        </template>
        <v-list-item-subtitle>{{ profile.displayName }}</v-list-item-subtitle>
        <v-list-item-subtitle>@{{ profile.handle }}</v-list-item-subtitle>
      </v-list-item>
    </v-card-actions>
  </v-card>

  <v-card class="mx-auto mt-5">
    <v-card-item>
      <v-select v-if="mode == 'post'" v-model="item" :hint="`${item.discription}`" :items="itemsForPost" item-title="name"
        item-value="value" label="report" persistent-hint return-object single-line></v-select>
      <v-select v-if="mode == 'user'" v-model="item" :hint="`${item.discription}`" :items="itemsForUser" item-title="name"
        item-value="value" label="report" persistent-hint return-object single-line></v-select>
    </v-card-item>
    <v-card-actions>
      <v-btn icon @click.prevent="report"><v-icon>mdi-send</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRequestPost } from '../common/requestPost.js'
import { useRequestGet } from '../common/requestGet.js'
import { useRoute, useRouter } from "vue-router"
import { useToast } from 'vue-toastification'
import { useStore } from 'vuex'
import { useDate } from "@/common/date";

const { convertDate } = useDate()

const toast = useToast()
const store = useStore()
const route = useRoute()
const router = useRouter()
const requestPost = useRequestPost(store)
const requestGet = useRequestGet(store)
const mode = ref(null)

const item = ref({ name: '', value: "", discription: "" })
const itemsForPost = ref([{ name: 'Spam', value: "com.atproto.moderation.defs#reasonSpam", discription: "Spam: frequent unwanted promotion, replies, mentions" },
{ name: 'Sexual', value: "com.atproto.moderation.defs#reasonSexual", discription: "Unwanted or mis-labeled sexual content" },
{ name: 'Violation', value: "com.atproto.moderation.defs#reasonViolation", discription: "Direct violation of server rules, laws, terms of service" },
{ name: 'Other', value: "com.atproto.moderation.defs#reasonOther", discription: "Other: reports not falling under another report category" },
])
const itemsForUser = ref([{ name: 'Misleading', value: "com.atproto.moderation.defs#reasonMisleading", discription: "Misleading identity, affiliation, or content" },
{ name: 'Spam', value: "com.atproto.moderation.defs#reasonSpam", discription: "Spam: frequent unwanted promotion, replies, mentions" },
{ name: 'Rude', value: "com.atproto.moderation.defs#reasonRude", discription: "Rude, harassing, explicit, or otherwise unwelcoming behavior" }
])

const post = ref(null)
const profile = ref(null)

onBeforeMount(async () => {
  if (route.path.startsWith("/reportPost")) {
    mode.value = "post"
    try {
      const response = await requestGet.get("app.bsky.feed.getPosts", { uris: [route.params.uri] })
      if (response.res.posts.length == 0) {
        return
      }
      post.value = response.res.posts[0]
    } catch (e) {
      toast.error(e, { position: "top-right" })
    }
  } else if (route.path.startsWith("/reportUser")) {
    mode.value = "user"
    try {
      const response = await requestGet.get("app.bsky.actor.getProfile", { actor: [route.params.handle] })
      profile.value = response.res
      console.log(profile.value)
    } catch (e) {
      toast.error(e, { position: "top-right" })
    }
  }
})

const report = async () => {
  try {
    let params = {}
    if (mode.value == "post") {
      params = {
        reasonType: item.value.value,
        subject: {
          $type: "com.atproto.repo.strongRef",
          cid: post.value.cid,
          uri: post.value.uri
        }
      }
    } else if (mode.value == "user") {
      params = {
        reasonType: item.value.value,
        subject: {
          $type: "com.atproto.admin.defs#repoRef",
          did: profile.value.did
        }
      }
    }
    await requestPost.post("com.atproto.moderation.createReport", params)
    router.go(-1)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>