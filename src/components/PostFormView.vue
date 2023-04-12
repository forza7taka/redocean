<template>
  <v-dialog>
    <v-card>
      <v-card-title>{{ mode }}</v-card-title>
      <div v-if="parent">
        <v-card :style="{ width: `400px` }" class="mx-auto mt-5">
        <v-card-actions>
          <v-list-item class="w-100">
            <template v-slot:prepend>
              <div style="padding-right: 10px">
                <router-link :to="`/profile/${parent.author.handle}`">
                  <v-avatar color="surface-variant">
                    <v-img cover v-bind:src=parent.author.avatar alt="avatar"></v-img>
                  </v-avatar>
                </router-link>
              </div>
            </template>
            <v-list-item-subtitle>{{ parent.author.displayName }}</v-list-item-subtitle>
            <v-list-item-subtitle>@{{ parent.author.handle }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ parent.record.createdAt }}</v-list-item-subtitle>
          </v-list-item>
        </v-card-actions>
        <v-card-text class="text-pre-wrap">
          <div v-if="parent && parent.record && parent.record.text" v-html="this.replaceUrls(parent.record.text)"></div>
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
        <v-file-input ref="fileInput" v-model="files" accept="image/*" id="fileInput" style="display: none;" @change="handleChange"
          :multiple="true" prepend-icon="mdi-upload"></v-file-input>
        <v-btn icon @click="handleFileInputClick">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-btn icon @click="submit()"><v-icon>mdi-send</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  components: {
  },
  name: "App",
  data() {
    return {
      files: [],
      imageUrls: [],
      contents: '',
      cid: ''
    };
  },
  props: {
    mode: String,
    parent: {},
    root: {},
  },
  methods: {
    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    },
    handleFileInputClick() {
      this.$refs.fileInput.click(); // ファイル選択をトリガー
    },
    handleChange(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const element = files[i]
        this.files.push(element);
        this.imageUrls.push(URL.createObjectURL(element));
      }
    },
    async getBlob(file) {
      const blob = new Blob([file], { type: file.type });
      return blob;
    },
    async uploadImage(blob) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      const response = await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', blob)
      return response.data.blob
    },
    async post() {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        collection: "app.bsky.feed.post",
        repo: this.$store.getters.getDid,
        record: { text: this.contents, createdAt: new Date() }
      })
        .then(response => {
          console.log(response)
        })
        .catch(err => {
          console.error(err)
        })
    },
    async postWithImage() {
      if (this.files.length != 0) {
        let imgs = []
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i]
          const blob = await this.getBlob(file);
          const image = await this.uploadImage(blob)
          imgs.push({ alt: "", image })
        }
        console.log(imgs)
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          collection: "app.bsky.feed.post",
          repo: this.$store.getters.getDid,
          record: {
            text: this.contents, createdAt: new Date(),
            embed: {
              $type: "app.bsky.embed.images",
              images: imgs
            }
          }
        }
        )
          .then(response => {
            console.log(response)
            this.images = []
            this.files = []
          })
          .catch(err => {
            console.error(err)
            this.images = []
            this.files = []
          })
        this.$emit('onPostDialogClose', false)
      }
    },
    async submit() {
      if (this.mode == "Post") {
        if (this.files.length != 0) {
          await this.postWithImage()
        } else {
          await this.post()
        }
      } else {
        if (this.files.length != 0) {
          await this.replyWithImage()
        } else {
          await this.reply()
        }
      }
      this.$emit('onPostDialogClose', false)
    },
    async reply() {
      let parent = { uri: this.parent.uri, cid: this.parent.cid }
      let root = { uri: this.root.uri, cid: this.root.cid }

      console.log(parent)
      console.log(root)

      this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
      this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        collection: "app.bsky.feed.post",
        repo: this.$store.getters.getDid,
        record: {
          text: this.contents,
          createdAt: new Date(),
          reply: {
            handle: this.$store.getters.getHandle,
            parent: parent,
            root: root,
          }
        }
      })
        .then(response => {
          console.log(response)
        })
        .catch(err => {
          console.error(err)
        })
    },
    async replyWithImage() {
      if (this.files.length != 0) {
        let imgs = []
        for (let i = 0; i < this.files.length; i++) {
          const file = this.files[i]
          const blob = await this.getBlob(file);
          const image = await this.uploadImage(blob)
          imgs.push({ alt: "", image })
        }
        let parent = { uri: this.parent.uri, cid: this.parent.cid }
        let root = { uri: this.root.uri, cid: this.root.cid }

        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          collection: "app.bsky.feed.post",
          repo: this.$store.getters.getDid,
          record: {
            text: this.contents,
            createdAt: new Date(),
            embed: {
              $type: "app.bsky.embed.images",
              images: imgs
            },
            reply: {
              handle: this.$store.getters.getHandle,
              parent: parent,
              root: root,
            }
          }

        })
          .then(response => {
            console.log(response)
          })
          .catch(err => {
            console.error(err)
          })
      }
    },
  },
}

</script>

<style>
.v-dialog__content {
  margin: auto;
}
</style>