<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col v-for="(l, index) in logins" :key="index" cols="12" md="6" lg="4">
          <v-card width="380px" class="mx-auto pa-4">
            <v-text-field label="server" placeholder="https://bsky.social" color="green darken-5" clearable dense
              v-model="l.server"></v-text-field>
            <v-text-field label="xxxx.bsky.social" placeholder="xxxx.bsky.social" color="green darken-5" clearable dense
              v-model="l.handle"></v-text-field>
            <v-text-field label="password" placeholder="password" color="green darken-5" clearable dense type="password"
              v-model="l.password"></v-text-field>
            <v-color-picker
              disabled
              hide-canvas
              hide-inputs
              hide-mode-switch
              hide-sliders
              mode="rgba"
              show-swatches
              swatches-max-height="210"
              v-model=l.color
            ></v-color-picker>
            <br>
            <v-btn @click.prevent="login(l.server, l.handle, l.password, l.color)" icon="mdi-login" size="42"></v-btn>
            &nbsp;
            <v-btn v-if="logins.length > 1" @click="del(index)" icon="mdi-minus" size="42"></v-btn>
            &nbsp;
            <v-btn v-if="l.server && l.handle && l.password && index == logins.length - 1"
              @click="add" size="42" icon="mdi-plus"></v-btn>
          </v-card>
        </v-col>
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
import { useStorage } from '@vueuse/core'
const failed = ref(false)
const followsCursor = ref(null)
const likesCursor = ref(null)
const mutesCursor = ref(null)
const repostsCursor = ref(null)
const store = useStore()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const route = useRouter()
const toast = createToaster()
const completed = ref(false)
const logins = ref([{ server: null, handle: null, password: null, color: null }])

const storageLogins = useStorage('storageLogins', logins)
const cloudTranslationApiKey = ref(null)
const storageCloudTranslationApiKey = useStorage('storageCloudTranslationApiKey', cloudTranslationApiKey)

const del = async (index) => {
  logins.value.splice(index, 1)
}

const add = async () => {
  logins.value.push({ server: null, handle: null, password: null, color: null })
}

onBeforeMount(async () => {

  try {

    logins.value = storageLogins.value
    cloudTranslationApiKey.value = storageCloudTranslationApiKey.value
    store.dispatch('doSetCloudTranslationApiKey', cloudTranslationApiKey.value);

    
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

const login = async (server, handle, password, color) => {
  failed.value = false
  try {
    store.dispatch('doSetServer', server)
    const res1 = await requestPost.post("com.atproto.server.createSession", {
      identifier: handle,
      password: password
    })
    store.dispatch('doCreateSession', res1.res);

    store.dispatch('doSetColor', color);

    const res2 = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    store.dispatch('doSetProfile', res2.res);

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
      await getReposts(repostsCursor)
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

const getFollows = async (handle, cur) => {
  let params = {}
  if (!cur.value) {
    params = { actor: handle, limit: 100 }
  } else {
    params = { actor: handle, cursor: cur.value, limit: 100 }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getFollows", params)
    followsCursor.value = response.res.cursor
    if (response.res.follows.length == 0) {
      completed.value = true
      return
    }
    store.dispatch('doAddFollows', response.res)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getMutes = async (cur) => {
  let params = {}
  if (!cur.value) {
    params = {}
  } else {
    params = { cursor: cur.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getMutes", params)
    mutesCursor.value = response.res.cursor
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

const getLikes = async (cur) => {
  try {
    let params = {}
    if (!cur) {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.like",
        limit: 100
      }
    } else {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.like",
        cursor: cur.value,
        limit: 100
      }
    }
    let response = null
    try {
      response = await requestGet.get("com.atproto.repo.listRecords", params)
    } catch (e) {
      if (!(e.response && e.response.status === 400)) {
        completed.value = true
        throw e
      }
    }
    likesCursor.value = response.res.cursor
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

const getReposts = async (cur) => {
  try {
    let params = {}
    if (!cur) {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.repost",
        limit: 100
      }
    } else {
      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.feed.repost",
        cursor: cur.value,
      }
    }
    let response = null
    try {
      response = await requestGet.get("com.atproto.repo.listRecords", params)
    } catch (e) {
      if (!(e.response && e.response.status === 400)) {
        completed.value = true
        throw e
      }
    }
    repostsCursor.value = response.res.cursor
    if (response.res.records.length == 0) {
      completed.value = true
      return
    }
    console.log(response.res)
    store.dispatch('doAddReposts', response.res)
  } catch (e) {
    toast.error(e, { position: "top-right" })
    completed.value = true
  }
}
</script>
