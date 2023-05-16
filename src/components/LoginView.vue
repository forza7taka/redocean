<template>
  <div class="displayArea">
    <v-card>
      <v-card-text>

        <v-tabs v-model="tab">
          <v-tab v-for="(l, index) in logins" :key="index" :value=index>
            <div v-if="l.avatar">
              <v-avatar :style="`border: 5px solid ${l.color};`">
                <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
              </v-avatar>
            </div>
            <div v-if="!l.avatar">
              New Account
            </div>
          </v-tab>
        </v-tabs>
      </v-card-text>

      <v-card-text>
        <v-window v-model="tab">
          <div v-for="(l, index) in logins" :key="index">
            <v-window-item :value=index>
              <v-card class="mx-auto pa-4">
                <v-combobox v-model="l.server"
                  :items="['https://bsky.social', 'https://boobee.blue', 'https://atproto.forza7.org']" label="server"
                  placeholder="https://bsky.social" color="green darken-5" clearable dense
                  variant="outlined"></v-combobox>
                <v-text-field label="xxxx.bsky.social" placeholder="xxxx.bsky.social" color="green darken-5" clearable
                  dense v-model="l.handle" variant="outlined"></v-text-field>
                <v-text-field label="app password" placeholder="app password" color="green darken-5" clearable dense
                  type="password" v-model="l.password" :rules="AppPasswordRules" variant="outlined"></v-text-field>
                <!-- <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
                  swatches-max-height="210" v-model=l.color></v-color-picker> -->
                <br>
                <template v-if="l.server && l.handle && l.password">
                  <v-btn @click.prevent="login(l.server, l.handle, l.password)" icon="mdi-login" size="42"></v-btn>
                </template>
                &nbsp;
                <template v-if="l.did">
                  <v-btn :to="`/accountSetting/${l.did}`" icon="mdi-cog-outline" size="42"></v-btn>
                  &nbsp;
                </template>
                <v-btn v-if="logins.length > 1" @click="del(index)" icon="mdi-minus" size="42"></v-btn>
                &nbsp;
                <v-btn v-if="l.server && l.handle && l.password && index == logins.length - 1" @click="add" size="42"
                  icon="mdi-plus"></v-btn>
              </v-card>
            </v-window-item>
          </div>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>

import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'
import { useRouter } from "vue-router"
import { useStorage } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';

const tab = ref(null)
const failed = ref(false)
const followsCursor = ref(null)
const likesCursor = ref(null)
const mutesCursor = ref(null)
const blocksCursor = ref(null)
const repostsCursor = ref(null)
const store = useStore()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const route = useRouter()
const completed = ref(false)
const logins = ref([{ server: null, handle: null, password: null, did: null }])

const storageLogins = useStorage('storageLogins', logins)
const cloudTranslationApiKey = ref(null)
const storageCloudTranslationApiKey = useStorage('storageCloudTranslationApiKey', cloudTranslationApiKey)

const AppPasswordRules = [
  (value) => {
    const regex = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;
    if (!value) {
      return 'App Password is required';
    } else if (!regex.test(value)) {
      return 'App Password must be valid';
    } else {
      return true;
    }
  },
];

const del = async (index) => {
  logins.value.splice(index, 1)
}

const add = async () => {
  logins.value.push({ server: null, handle: null, password: null, avatar: null, did: null })
}

onBeforeMount(async () => {

  try {
    logins.value = storageLogins.value
    cloudTranslationApiKey.value = storageCloudTranslationApiKey.value
    store.dispatch('doSetCloudTranslationApiKey', cloudTranslationApiKey.value);

  } catch (e) {
    failed.value = true
    const ce = useCatchError()
    ce.catchError(e)
  }
})

const login = async (server, handle, password) => {
  failed.value = false
  try {
    store.dispatch('doSetServer', server)
    const loginResponse = await requestPost.post("com.atproto.server.createSession", {
      identifier: handle,
      password: password
    })
    logins.value[tab.value].did = loginResponse.res.did
    store.dispatch('doCreateSession', loginResponse.res);

    //store.dispatch('doSetColor', color);

    const profileResponse = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    store.dispatch('doSetProfile', profileResponse.res);

    logins.value[tab.value].avatar = profileResponse.res.avatar

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
    completed.value = false
    while (!completed.value) {
      await getBlocks(blocksCursor)
    }
    route.push('/timeline')
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
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
    const ce = useCatchError()
    ce.catchError(e)
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
    const ce = useCatchError()
    ce.catchError(e)
    completed.value = true
  }
}

const getBlocks = async (cur) => {
  let params = {}
  if (!cur.value) {
    params = {}
  } else {
    params = { cursor: cur.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getBlocks", params)
    blocksCursor.value = response.res.cursor
    if (response.res.blocks.length == 0) {
      completed.value = true
      return
    }
    console.log(response.res)
    store.dispatch('doAddBlocks', response.res)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
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
    const ce = useCatchError()
    ce.catchError(e)
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
    const ce = useCatchError()
    ce.catchError(e)
    completed.value = true
  }
}
</script>
