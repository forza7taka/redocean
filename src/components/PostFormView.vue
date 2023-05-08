<template>
  <v-card class="mx-auto mt-5">
    <v-card-title>{{ mode }}</v-card-title>
    <div v-if="parentPost">
      <v-card class="mx-auto mt-5">
        <v-card-actions>
          <v-list-item class="w-100">
            <template v-slot:prepend>
              <div style="padding-right: 10px">
                <router-link :to="`/profile/${parentPost.author.handle}`">
                  <v-avatar color="surface-variant">
                    <v-img cover v-bind:src=parentPost.author.avatar alt="avatar"></v-img>
                  </v-avatar>
                </router-link>
              </div>
            </template>
            <v-list-item-subtitle>{{ parentPost.author.displayName }}</v-list-item-subtitle>
            <v-list-item-subtitle>@{{ parentPost.author.handle }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ parentPost.record.createdAt }}</v-list-item-subtitle>
          </v-list-item>
        </v-card-actions>
        <v-card-text>
          <div v-if="parentPost && parentPost.record && parentPost.record.text">{{ parentPost.record.text }}</div>
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
            <v-img width="100" id="image" :src=image>
            </v-img>
          </v-col>
        </div>
      </v-row>
    </v-card-text>

    <div v-if="quotePost">
      <v-card class="mx-auto mt-5">
        <v-card-actions>
          <v-list-item class="w-100">
            <template v-slot:prepend>
              <div style="padding-right: 10px">
                <router-link :to="`/profile/${quotePost.author.handle}`">
                  <v-avatar color="surface-variant">
                    <v-img cover v-bind:src=quotePost.author.avatar alt="avatar"></v-img>
                  </v-avatar>
                </router-link>
              </div>
            </template>
            <v-list-item-subtitle>{{ quotePost.author.displayName }}</v-list-item-subtitle>
            <v-list-item-subtitle>@{{ quotePost.author.handle }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ quotePost.record.createdAt }}</v-list-item-subtitle>
          </v-list-item>
        </v-card-actions>
        <v-card-text>
          <div v-if="quotePost && quotePost.record && quotePost.record.text">{{ quotePost.record.text }}</div>
        </v-card-text>
      </v-card>
    </div>


    <v-card-actions>
      <v-btn icon type="button" @click="open">
        <v-icon>mdi-upload</v-icon>
      </v-btn>
      <v-btn icon @click.prevent="send"><v-icon>mdi-send</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useRequestPost } from '../common/requestPost.js'
import { useRequestGet } from '../common/requestGet.js'
import { useRoute, useRouter } from "vue-router"
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
const route = useRoute()
const router = useRouter()
const requestPost = useRequestPost(store)
const requestGet = useRequestGet(store)

const imageUrls = ref([])
const contents = ref(null)

const mode = ref(null)

const parentPost = ref(null)
const root = ref(null)
const parent = ref(null)
const quotePost = ref(null)

onBeforeMount(async () => {
  if (route.path.startsWith("/post")) {
    mode.value = "post"
  } else if (route.path.startsWith("/reply")) {
    mode.value = "reply"
    try {
      const response = await requestGet.get("app.bsky.feed.getPosts", { uris: [route.params.uri] })
      if (response.res.posts.length == 0) {
        return
      }
      parentPost.value = response.res.posts[0]
      parent.value = { uri: parentPost.value.uri, cid: parentPost.value.cid }
      if (parentPost.value.root) {
        root.value = { uri: parentPost.value.root.uri, cid: parentPost.value.root.cid }
      } else {
        root.value = { uri: parentPost.value.uri, cid: parentPost.value.cid }
      }
    } catch (e) {
      toast.error(e, { position: "top-right" })
    }
  } else if (route.path.startsWith("/quoteRepost")) {
    mode.value = "quoteRepost"
    try {
      const response = await requestGet.get("app.bsky.feed.getPosts", { uris: [route.params.uri] })
      if (response.res.posts.length == 0) {
        return
      }
      quotePost.value = response.res.posts[0]
    } catch (e) {
      toast.error(e, { position: "top-right" })
    }

  }
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
    const index = { byteStart: match.index, byteEnd: match.index + match[0].length }
    let did = ""
    try {
      const response = await requestGet.get("com.atproto.identity.resolveHandle", { handle: match[0].replace('@', '') })
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
  await requestPost.post("com.atproto.repo.createRecord", {
    collection: "app.bsky.feed.post",
    repo: store.getters.getDid,
    record: {
      text: contents.value,
      createdAt: new Date(),
      facets: await getRichTexts(contents.value),
      reply: {
        handle: store.getters.getHandle,
        parent: parent.value,
        root: root.value,
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
          parent: parent.value,
          root: root.value,
        }
      }
    })
  }
}

const quoteRepost = async () => {
  await requestPost.post("com.atproto.repo.createRecord", {
    collection: "app.bsky.feed.post",
    repo: store.getters.getDid,
    record: {
      text: contents.value,
      createdAt: new Date(),
      facets: await getRichTexts(contents.value),
      embed: {
        $type: "app.bsky.embed.record",
        record: {
          cid: quotePost.value.cid,
          uri: quotePost.value.uri
        }
      }
    }
  })
}

const quoteRepostWithImage = async () => {
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
          $type: "app.bsky.embed.recordWithMedia",
          media: {
            $type: "app.bsky.embed.images",
            images: imgs
          },
          record: {
            $type: "app.bsky.embed.record",
            record: {
              cid: quotePost.value.cid,
              uri: quotePost.value.uri
            }
          }
        }
      }
    })
  }
}


const send = async () => {
  try {
    if (mode.value == "post") {
      if (files.value && files.value.length != 0) {
        await postWithImage()
      } else {
        await post()
      }
    } else if (mode.value == "reply") {
      if (files.value && files.value.length != 0) {
        await replyWithImage()
      } else {
        await reply()
      }
    } else if (mode.value == "quoteRepost") {
      if (files.value && files.value.length != 0) {
        await quoteRepostWithImage()
      } else {
        await quoteRepost()
      }
    }
    router.go(-1)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>
