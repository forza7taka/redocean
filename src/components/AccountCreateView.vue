<template>
  <div class="displayArea mx-auto">
    <div>
      <v-text-field label="server" placeholder="https:://bsky.social" color="green darken-5" clearable dense
        v-model="server" @input="onInputServer" variant="outlined"></v-text-field>
    </div>
    <div>
      <v-text-field label="mailAddress" placeholder="xxxx@xxxx.xxx" color="green darken-5" clearable dense
        v-model="mailAddress" variant="outlined"></v-text-field>
    </div>
    <div>
      <v-text-field label="handle" placeholder="handle" color="green darken-5" clearable dense
        v-model="handle" variant="outlined"></v-text-field>
    </div>
    <div>
      <v-text-field label="password" placeholder="password" color="green darken-5" clearable dense type="password"
        v-model="password" variant="outlined"></v-text-field>
    </div>
    <div>
      <v-text-field label="invite Code" placeholder="" color="green darken-5" clearable dense
        v-model="inviteCode" variant="outlined"></v-text-field>
    </div>
    <v-row justify="center">
      <label>Your Handle is "{{ handle }}{{ userDomain }}"</label>
    </v-row>
    <v-row justify="center">
      <v-btn @click.prevent="create">Create</v-btn>
    </v-row>
    <v-row v-if="links" justify="center">
      <a :href=links.privacyPolicy>privacyPolicy</a>
    </v-row>
    <v-row v-if="links" justify="center">
      <a :href=links.termsOfService>termsOfService</a>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createToaster } from '@meforma/vue-toaster'
import { useRoute } from "vue-router"
import axios from 'axios'
import urlJoin from 'url-join'

const route = useRoute()
const toast = createToaster()

const server = ref(null)
const mailAddress = ref(null)
const handle = ref(null)
const password = ref(null)
const inviteCode = ref("")
const userDomain = ref(".bsky.social")
const links = ref(null)
const onInputServer = async () => {
  try {
    const url = urlJoin(server.value, 'xrpc', "com.atproto.server.describeServer")
    const response = await axios.get(url)
    userDomain.value = response.data.availableUserDomains[0]
    links.value = response.data.links
  } catch {
    userDomain.value = ".bsky.social"
    links.value = null
  }
}

const create = async () => {
  try {
    const url = urlJoin(server.value, 'xrpc', "com.atproto.server.createAccount")
    await axios.post(url, {
      email: mailAddress.value,
      handle: handle.value + userDomain.value,
      password: password.value,
      inviteCode: inviteCode.value
    })
    route.push('/')
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}
</script>