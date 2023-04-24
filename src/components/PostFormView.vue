<template>
  <v-dialog>
    <v-card>
      <v-card-title>{{ props.mode }}</v-card-title>
      <div v-if="parent">
        <v-card :style="{ width: `400px` }" class="mx-auto mt-5">
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
            <div v-if="parent && props.parent.record && props.parent.record.text" v-html="replaceUrls(props.parent.record.text)"></div>
          </v-card-text>
        </v-card>
      </div>

      <v-card-text>
        <v-textarea required counter v-model=contents label="contents"></v-textarea>
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
        <v-file-input ref="fileInput" v-model="files" accept="image/*" id="fileInput" style="display: none;"
          @change="selectImage" :multiple="true" prepend-icon="mdi-upload"></v-file-input>
        <v-btn icon @click.prevent="handleFileInputClick">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-btn icon @click.prevent="send"><v-icon>mdi-send</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps } from 'vue'
import { ref, defineEmits } from 'vue'
import { useRequestPost }from '../common/requestPost.js'
import { useToast } from 'vue-toastification'
import { useStore } from 'vuex'
import { useReplaceUrls } from '../common/replaceUrls.js'
const toast = useToast()
const store = useStore()
const requestPost = useRequestPost(store)
const { replaceUrls } = useReplaceUrls()


const files = ref([])
const imageUrls = ref([])
const contents = ref(null)

const fileInput = ref(null)

const emits = defineEmits(['onPostDialogClose'])

const props = defineProps({
  mode: String,
  parent: {},
  root: {},
})

const handleFileInputClick = async () => {
  fileInput.value.click()
}

const selectImage = async (event) => {
  const targetFiles = event.target.files;
  for (let i = 0; i < targetFiles.length; i++) {
    const element = targetFiles[i]
    files.value.push(element)
    imageUrls.value.push(URL.createObjectURL(element))
  }
}

const getBlob = async (file) => {
  const blob = new Blob([file], { type: file.type });
  return blob
}

const uploadImage = async (blob) => {
  const response = await requestPost.post("com.atproto.repo.uploadBlob", blob)
  return response.res.blob
}

const post = async () => {
    await requestPost.post("com.atproto.repo.createRecord", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      record: { text: contents.value, createdAt: new Date() }
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
        repo: this.$store.getters.getDid,
        record: {
          text: contents.value, createdAt: new Date(),
          embed: {
            $type: "app.bsky.embed.images",
            images: imgs
          }
        }
      })
    }
}

const send = async () => {
  try {
    if (props.mode == "Post") {
      if (files.value.length != 0) {
        await postWithImage()
      } else {
        await post()
      }
    } else {
      if (files.value.length != 0) {
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

const reply = async () => {
    const parent = { uri: props.parent.uri, cid: props.parent.cid }
    const root = { uri: props.root.uri, cid: props.root.cid }
    await requestPost.post("com.atproto.repo.createRecord", {
      collection: "app.bsky.feed.post",
      repo: store.getters.getDid,
      record: {
        text: contents.value,
        createdAt: new Date(),
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
      const parent = { uri: props.parent.uri, cid:  props.parent.cid }
      const root = { uri:  props.root.uri, cid:  props.root.cid }

      await requestPost.post("com.atproto.repo.createRecord", {
        collection: "app.bsky.feed.post",
        repo: store.getters.getDid,
        record: {
          text: contents.value,
          createdAt: new Date(),
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
</script>

<style>
.v-dialog__content {
  margin: auto;
}
</style>