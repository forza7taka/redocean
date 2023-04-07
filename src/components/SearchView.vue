<template>
  <v-dialog>
    <v-card>
      <v-card-title>Search</v-card-title>
      <v-card-text>
        <v-text-field required v-model=keyword></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn icon @click="submit()"><v-icon>mdi-magnify</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      keyword: ''
    };
  },
  props: {
  },
  methods: {
    async submit() {



      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.listRecords', { params:{
          repo:this.$store.getters.getDid,
          collection:"app.bsky.feed.like"
        } })
        console.log(response)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
      this.$emit('onSearchDialogClose', false)
    },
  },
}

</script>

<style>
.v-dialog__content {
  margin: auto;
}
</style>