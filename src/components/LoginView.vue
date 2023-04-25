<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col v-for="(l, index) in logins" :key="index" cols="12" md="6" lg="4">
          <v-card width="400px" class="mx-auto pa-4">
            <v-text-field label="server" placeholder="https://bsky.social" color="green darken-5" clearable dense
              v-model="l.server"></v-text-field>
            <v-text-field label="xxxx.bsky.social" placeholder="xxxx.bsky.social" color="green darken-5" clearable dense
              v-model="l.handle"></v-text-field>
            <v-text-field label="password" placeholder="password" color="green darken-5" clearable dense type="password"
              v-model="l.password"></v-text-field>
            <v-btn @click.prevent="login(l.server, l.handle, l.password)">Login</v-btn>
          </v-card>
        </v-col>
        <v-btn @click="add"><v-icon>mdi-plus</v-icon></v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'
import { useRouter } from "vue-router"
import { useLocalStorage } from '@vueuse/core'

const failed = ref(false)
const followsCursor = ref(null)
const likesCursor = ref(null)
const mutesCursor = ref(null)
const store = useStore()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const route = useRouter()
const toast = createToaster()
const completed = ref(false)

const logins = ref([{ server: null, handle: null, password: null }])

const add = async () => {
  logins.value.push({ server: null, handle: null, password: null })
}
const storageLogins = useLocalStorage('storageLogins', logins)

onBeforeMount(async () => {
  logins.value = storageLogins.value
  try {
    if (failed.value) {
      return
    }
    if ((store.getters.getDid) && (store.getters.getAccessJwt)) {
      // axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getRefreshJwt
      // const response = await requestPost.post("com.atproto.server.refreshSession")
      // store.dispatch('doCreateSession', response.res)
      // axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt 
      // route.push('/timeline')
    }
  } catch (e) {
    failed.value = true
    console.error(e)
  }
})

const login = async (server, handle, password) => {
  failed.value = false
  try {
    store.dispatch('doSetServer', server)
    const response = await requestPost.post("com.atproto.server.createSession", {
      identifier: handle,
      password: password
    })
    store.dispatch('doCreateSession', response.res)
    storageLogins.value = logins.value
    while (!completed.value) {
      await getFollows(handle, followsCursor)
    }

    completed.value = false
    while (!completed.value) {
      await getLikes(likesCursor)
    }
    completed.value = false
    while (!completed.value) {
      await getMutes(mutesCursor)
    }
    route.push('/timeline')
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getFollows = async (handle, cursor) => {
  let params = {}
  if (!cursor.value) {
    params = { actor: handle }
  } else {
    params = { actor: handle, cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getFollows", params)
    cursor.value = response.res.cursor
    if (response.res.follows.length == 0) {
      completed.value = true
      return
    }
    store.dispatch('doAddFollows', response.res)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getMutes = async (cursor) => {
  let params = {}
  if (!cursor.value) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getMutes", params)
    cursor.cursor = response.res.cursor
    if (response.res.mutes.length == 0) {
      completed.value = true
      return
    }
    store.dispatch('doAddMutes', response.res)
  } catch (e) {
    toast.error(e, { position: "top-right" })
    completed.value = true
  }
}

const getLikes = async (cursor) => {
  try {
    let params = {}
    if (!cursor) {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.like",
        limit: 100
      }
    } else {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.like",
        cursor: cursor.value
      }
    }
    let response = null
    try {
      console.log(params)
      response = await requestGet.get("com.atproto.repo.listRecords", params)
    } catch (e) {
      if (!(e.response && e.response.status === 400)) {
        completed.value = true
        throw e
      }
    }
    cursor.value = response.res.cursor
    if (response.res.records.length == 0) {
      completed.value = true
      return
    }
    store.dispatch('doAddLikes', response.res)
  } catch (e) {
    toast.error(e, { position: "top-right" })
    completed.value = true
  }
}
</script>
