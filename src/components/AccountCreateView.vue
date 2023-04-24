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

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestGet } from '../common/requestGet.js'

const mailAddress = ref(null)
const handle = ref(null)
const password = ref(null)
const inviteCode = ref(null) 
const create = async () => {
  try {
    const store = useStore()
    const req = useRequestGet(store)
    await req.post("/com.atproto.server.createAccount", {
      email: this.mailAddress,
      handle: this.handle,
      password: this.password,
      inviteCode: this.inviteCode
    })
    this.$router.push('/timeline')
  } catch (e) {
        const toast = createToaster()
    toast.error(e, { position: "top-right" })
  }
}
</script>