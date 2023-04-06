<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <template v-slot:prepend>
        <v-avatar color="grey" size="150" rounded="0">
          <v-img v-if="!avatar" cover v-bind:src=profile.avatar alt="avatar"></v-img>
          <v-img v-if="avatar" cover v-bind:src=avatarUrl alt="avatar"></v-img>
        </v-avatar>
      </template>
      <v-card-actions>
        <v-label for="fileInput" class="v-btn v-btn--outlined"><v-icon>mdi-upload</v-icon></v-label>
        <v-file-input :v-model=[avatar] accept="image/*" id="fileInput" style="display: none;" @change="selectAvator"
            :multiple=false prepend-icon="mdi-upload"></v-file-input>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <v-text-field v-model="profile.displayName" label="displayName"></v-text-field>
        <v-textarea counter v-model="profile.description" label="description"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn icon @click="updateProfile"><v-icon>mdi-content-save</v-icon></v-btn>
<!--        <v-btn icon @click="createInviteCode"><v-icon>mdi-content-save</v-icon></v-btn>-->
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  components: {
  },
  setup() {
  },
  data() {
    return {
      profile: {},
      avatar: null,
      avatarUrl: null
    };
  },
  computed: {
  },
  async beforeMount() {
    this.getProfile(this.$store.getters.getHandle)
  },
  mounted() {
  },
  methods: {
    async createInviteCode() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.server.createInviteCode', {
          params: {
            useCount: 5
          }
        })
        console.log(response.data)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    selectAvator(event) {
      const file = event.target.files[0];
      this.avatar = file;
      this.avatarUrl = URL.createObjectURL(file);
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
    async getProfile(handle) {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
          params: {
            actor: handle
          }
        })
        this.profile = response.data
        console.log(this.profile)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async updateProfile() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.getRecord', {
          params: {
              repo: this.$store.getters.getDid,
              collection: "app.bsky.actor.profile",
              rkey: "self",
          }
        })
        let cid = response.data.cid
        let avatarCid = response.data.value.avatar.cid
        let mimeType = response.data.value.avatar.mimeType

        if (this.avatar) {
          const blob = await this.getBlob(this.avatar);
          const image = await this.uploadImage(blob)
          avatarCid = image.ref.$link
          mimeType = this.avatar.type
        }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        await this.axios.post('https://bsky.social/xrpc/com.atproto.repo.putRecord', {
          repo: this.$store.getters.getDid,
          collection: "app.bsky.actor.profile",
          rkey: "self",
          record: {
            $type: "app.bsky.actor.profile",
            avatar: { cid: avatarCid, mimeType: mimeType },
            description: this.profile.description,
            displayName: this.profile.displayName
          },
          swapRecord: cid
        })
      } catch (e) {
        console.log(e)
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },

  }
}
</script>