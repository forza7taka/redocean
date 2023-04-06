<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <template v-slot:prepend>
        <v-avatar color="grey" size="150" rounded="0">
          <v-img cover v-bind:src=profile.avatar alt="avatar"></v-img>
        </v-avatar>
      </template>
      <v-card-text class="text-pre-wrap">
        <v-text-field v-model="profile.handle" label="handle"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn icon @click="updateHandle"><v-icon>mdi-content-save</v-icon></v-btn>
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
    async updateHandle() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.post('https://bsky.social/xrpc/com.atproto.identity.updateHandle', {
            handle: this.profile.handle
          
        })
        this.$store.dispatch('setHandle', response.data.handle);
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