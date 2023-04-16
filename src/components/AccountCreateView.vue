<template>
  <div>
    <div>
      <v-text-field label="mailAddress" placeholder="xxxx@xxxx.xxx" color="green darken-5" clearable dense
        v-model="mailAddress"></v-text-field>
    </div>
    <div>
      <v-text-field label="handle" placeholder="xxxx.bsky.social" color="green darken-5" clearable dense
        v-model="handle"></v-text-field>
    </div>
    <div>
      <v-text-field label="password" placeholder="password" color="green darken-5" clearable dense type="password"
        v-model="password"></v-text-field>
    </div>
    <div>
      <v-text-field label="invite Code" placeholder="" color="green darken-5" clearable dense
        v-model="inviteCode"></v-text-field>
    </div>
    <v-row justify="center">
      <v-btn @click.prevent="create">Create</v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  components: {
  },
  data() {
    return {
      mailAddress: '',
      handle: '',
      password: '',
      inviteCode: '',
    }
  },
  mounted() {
  },
  methods: {
    async create() {
      try {
        let response = await this.axios.post(process.env.VUE_APP_BASE_URI + "/com.atproto.server.createAccount", {
          email: this.mailAddress,
          handle: this.handle,
          password: this.password,
          inviteCode: this.inviteCode
        })
        console.log(response.data)
        this.$router.push('/timeline')
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    }
  }
}
</script>