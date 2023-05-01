<template>
  <v-dialog>
    <v-card :style="{ width: `400px` }" class="mx-auto mt-5">
      <v-card-title>{{ props.mode }}</v-card-title>
      <div v-if="parent">
        <v-card :style="{ width: `380px` }" class="mx-auto mt-5">
          <v-card-actions>
            <v-list-item class="w-100">
              <template v-slot:prepend>
                <div style="padding-right: 10px">
                  <router-link :to="`/profile/${props.parent.author.handle}`">
                    <v-avatar color="surface-variant">
                      <v-img cover v-bind:src=props.parent.author.avatar alt="avatar"></v-img>
                    </v-avatar>
                  </router-link>
                </div>
              </template>
              <v-list-item-subtitle>{{ props.parent.author.displayName }}</v-list-item-subtitle>
              <v-list-item-subtitle>@{{ props.parent.author.handle }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ props.parent.record.createdAt }}</v-list-item-subtitle>
            </v-list-item>
          </v-card-actions>
          <v-card-text class="text-pre-wrap">
            <div v-if="parent && props.parent.record && props.parent.record.text">{{ props.parent.record.text}}</div>
          </v-card-text>
        </v-card>
      </div>

      <v-card-text>
        <v-textarea required counter v-model=contents label="contents" maxlength=300></v-textarea>
      </v-card-text>
      <v-card-text>
        <v-row>
          <div v-for="(image, index) in imageUrls" :key="index">
            <v-col>
              <v-img width="50" id="image" :src=image>
              </v-img>
            </v-col>
          </div>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn icon  type="button" @click="open">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-btn icon @click.prevent="send"><v-icon>mdi-send</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useRequestPost }from '../common/requestPost.js'
import { useRequestGet } from '../common/requestGet.js'

import { useToast } from 'vue-toastification'
import { useStore } from 'vuex'

const { files, open, onChange } = useFileDialog()
onChange((files) => {
  for (let i = 0; i < files.length; i++) {
    const element = files[i]
    imageUrls.value.push(URL.createObjectURL(element))
  }
})

const toast = useToast()
const store = useStore()
const requestPost = useRequestPost(store)
const requestGet = useRequestGet(store)

const imageUrls = ref([])
const contents = ref(null)

const emits = defineEmits(['onPostDialogClose'])

const props = defineProps({
  mode: String,
  parent: {},
  root: {},
})

const getBlob = async (file) => {
  const blob = new Blob([file], { type: file.type });
  return blob
}

const uploadImage = async (blob) => {
  const response = await requestPost.post("com.atproto.repo.uploadBlob", blob)
  return response.res.blob
}

const getRichTexts = async (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const mentionRegex = /@[^\s@]+/g
  let match;
  const facets = [];
  
  while ((match = urlRegex.exec(text)) !== null) {
    const index = { byteStart: match.index, byteEnd: match.index + match[0].length }
    const features = [{ $type: "app.bsky.richtext.facet#link", uri: match[0] }]
    facets.push({ index: index, features: features });
  }
  while ((match = mentionRegex.exec(text)) !== null) {
    const index = { byteStart: match.index , byteEnd: match.index + match[0].length }
    let did = ""
    try {
      const response = await requestGet.get("com.atproto.identity.resolveHandle", { handle : match[0].replace('@','') })
      did = response.res.did
    } catch (e) {
      toast.error(e, { position: "top-right" })
      continue;
    }
    const features = [{ $type: "app.bsky.richtext.facet#mention", did: did }]
    facets.push({ index: index, features: features });
  }
  return facets;
}

const post = async () => {
    await requestPost.post("com.atproto.repo.createRecord", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      record: { text: contents.value, createdAt: new Date(), facets: await getRichTexts(contents.value) }
    })
}
const postWithImage = async () => {
  if (files.value.length != 0) {
    let imgs = []
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      const blob = await getBlob(file);
      const image = await uploadImage(blob)
      imgs.push({ alt: "", image })
    }
    await requestPost.post("com.atproto.repo.createRecord", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      record: {
        text: contents.value,
        createdAt: new Date(),
        facets: await getRichTexts(contents.value),
        embed: {
          $type: "app.bsky.embed.images",
          images: imgs
        }
      }
    })
  }
}

const reply = async () => {
  const parent = { uri: props.parent.uri, cid: props.parent.cid }
  const root = { uri: props.root.uri, cid: props.root.cid }
  await requestPost.post("com.atproto.repo.createRecord", {
    collection: "app.bsky.feed.post",
    repo: store.getters.getDid,
    record: {
      text: contents.value,
      createdAt: new Date(),
      facets: await getRichTexts(contents.value),
      reply: {
        handle: store.getters.getHandle,
        parent: parent,
        root: root,
      }
    }
  })
}

const replyWithImage = async () => {
  if (files.value.length != 0) {
    let imgs = []
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      const blob = await getBlob(file);
      const image = await uploadImage(blob)
      imgs.push({ alt: "", image })
    }
    const parent = { uri: props.parent.uri, cid: props.parent.cid }
    const root = { uri: props.root.uri, cid: props.root.cid }

    await requestPost.post("com.atproto.repo.createRecord", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      record: {
        text: contents.value,
        createdAt: new Date(),
        facets: await getRichTexts(contents.value),
        embed: {
          $type: "app.bsky.embed.images",
          images: imgs
        },
        reply: {
          handle: store.getters.getHandle,
          parent: parent,
          root: root,
        }
      }
    })
  }
}

const send = async () => {
  try {
    if (props.mode == "Post") {
      if (files.value && files.value.length != 0) {
        await postWithImage()
      } else {
        await post()
      }
    } else {
      if (files.value && files.value.length != 0) {
        await replyWithImage()
      } else {
        await reply()
      }
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
  emits('onPostDialogClose', false)
}
</script>

<style>
.v-dialog__content {
  margin: auto;
}
</style>