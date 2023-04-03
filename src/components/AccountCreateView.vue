<template>
  <div>
      <div>
        <v-text-field
          label="MailAddress"
          placeholder="xxxx@xxxx.xxx"
          color="green darken-5"
          clearable
          dense
          v-model="mailAddress"
        ></v-text-field>
      </div>
      <div>
        <v-text-field
          label="handle"
          placeholder="xxxx"
          color="green darken-5"
          clearable
          dense
          v-model="handle"
        ></v-text-field>
      </div>
      <div>
        <v-text-field
          label="password"
          placeholder="password"
          color="green darken-5"
          clearable
          dense
          type="password" 
          v-model="password"
        ></v-text-field>
      </div>
      <div>
        <v-text-field
          label="Invite Code"
          placeholder=""
          color="green darken-5"
          clearable
          dense
          v-model="inviteCode"
        ></v-text-field>
      </div>
      <v-row justify="center">
        <v-btn @click.prevent="create">Login</v-btn>
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
      await this.axios.post('https://bsky.social/xrpc/com.atproto.session.create', {
        handle: this.handle,
        password: this.password
      })
      .then(response => {
        console.log(response.data)
        
      })
      .catch(err => {
        console.error(err)
        this.message = err
        return
      })
      this.$router.push('/timeline')
    }
  }
}
</script>