<template>
  <v-dialog>
    <v-card>
      <v-card-title>{{ mode }}</v-card-title>
      <v-card-text>
        <v-textarea required v-model=contents label="contents"></v-textarea>    
      </v-card-text>
      <v-card-text>
        <v-row>
          <div v-for="(image, index) in images" :key="index">
            <v-col>
              <v-img width="50" id="image" :src=image></v-img>
            </v-col>
          </div>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <div>
          <v-label for="fileInput" color="primary" class="v-btn v-btn--outlined">images</v-label>
          <v-file-input
            v-model=files
            accept="image/*"
            id="fileInput"
            style="display: none;"
            @change="handleChange"
            :multiple="true"></v-file-input>
          </div>
          <v-btn color="primary" @click="submit()">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>         
</template>

<script>
  export default {
    name: "App",
    data() {
      return {
        files: [],
        images: [],
        contents: '',
        cid: ''
      };
    },
    props: {
      mode: String,
      feed: Object,
    },
    methods: {
      handleChange(event) {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
          const element = files[i]
          this.files.push(element);
          this.images.push(URL.createObjectURL(element));
        }
      },
      async getBlob(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
      },
      async uploadImage(blob) {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        const response =await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', blob)
        return response.data.blob
      },
      async post() {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: "app.bsky.feed.post",
            repo:  this.$store.getters.getDid,
            record: {text: this.contents, createdAt: new Date()}
          })
          .then(response => {
            console.log(response) 
          })
          .catch(err => {
            console.error(err)
          })
      },
      async postWithImage() {
        if (this.images.length != 0) {
          let imgs = []
          for (let i = 0; i < this.images.length; i++) {
            const img = this.images[i]
            const blob = await this.getBlob(img);
            const image = await this.uploadImage(blob)
            imgs.push({alt: "", image })
          }
          console.log(imgs)
          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: "app.bsky.feed.post",
            repo:  this.$store.getters.getDid,
            record: {text: this.contents, createdAt: new Date(), 
              embed:{
                $type:"app.bsky.embed.images",
                images : imgs
                }
              }}
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
          this.$emit('onClose', false)
        }
      },
      async submit() {
        if (this.mode == "Post") {
          if (this.images.length != 0) { 
            await this.postWithImage()
          } else {
            await this.post()
          }
        } else {
          if (this.images.length != 0) { 
            await this.replyWithImage()
          } else {
            await this.reply()
          }
        }
        this.$emit('onClose', false)
      },
      async reply() {
        let parent
        let root
        parent = {uri: this.feed.post.uri, cid: this.feed.post.cid}
        if (this.feed.reply && this.feed.reply.parent) {
          root = {uri: this.feed.reply.parent.uri, cid: this.feed.reply.parent.cid}
        } else {
          root = {uri: this.feed.post.uri, cid: this.feed.post.cid}  
        }

        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
          collection: "app.bsky.feed.post",
          did:  this.$store.getters.getDid,
          record: {text: this.contents,
                  createdAt: new Date(),
                  reply: {
                    handle: this.$store.getters.getHandle,
                    parent: parent,
                    root:   root,
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
        let imgs = []
        if (this.images.length != 0) {
          for (let i = 0; i < this.images.length; i++) {
          const img = this.images[i]
          const blob = await this.getBlob(img);
          const image = await this.uploadImage(blob)
          imgs.push({alt: "", image })
          } 
          let parent = {}
          let root = {}
          parent = {uri: this.feed.post.uri, cid: this.feed.post.cid}
          if (this.feed.reply && this.feed.reply.parent) {
            root = {uri: this.feed.reply.parent.uri, cid: this.feed.reply.parent.cid}
          } else {
            root = {uri: this.feed.post.uri, cid: this.feed.post.cid}  
          }

          this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
          this.axios.post('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            collection: "app.bsky.feed.post",
            repo:  this.$store.getters.getDid,
            record: {text: this.contents,
                     createdAt: new Date(),
                     embed:{
                     $type:"app.bsky.embed.images",
                     images : imgs
                    },
                    reply: {
                      handle: this.$store.getters.getHandle,
                      parent: parent,
                      root:   root,
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