<template>
  <div class="displayArea">
    <v-card>
      <v-card-text>
        <v-tabs v-model="tab">
          <v-tab v-for="(l, index) in logins" :key="index" :value=index>
            <template v-if="l.avatar">
              <v-avatar v-if="userSettings" :style="`border: 5px solid ${getColor(l.did)};`">
                <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
              </v-avatar>
            </template>
            <template v-if="!l.avatar && l.handle">
              {{ l.handle }}
            </template>
            <template v-if="!l.avatar && !l.handle">
              New Account
            </template>
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
                <br>
                <v-btn @click.prevent="login(l.server, l.handle, l.password)" icon="mdi-login" size="42"
                  :disabled="!(l.server && l.handle && l.password)"></v-btn>
                &nbsp;
                <v-btn :to="`/accountSetting/${l.did}`" icon="mdi-cog-outline" size="42" :disabled="!l.did"></v-btn>
                &nbsp;
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

import { ref, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'
import { useRouter } from "vue-router"
import { useStorage } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';

const tab = ref(null)
const failed = ref(false)
const followsCursor = ref(null)
const mutesCursor = ref(null)
const blocksCursor = ref(null)
const store = useStore()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const route = useRouter()
const completed = ref(false)
const logins = ref([{ server: null, handle: null, password: null, did: null, avatar: null }])

const storageLogins = useStorage('logins', logins, undefined,
  {
    serializer: {
      read: (v) => v ? JSON.parse(v) : null,
      write: (v) => JSON.stringify(v),
    },
  })
const settings = ref({ translationApiKey: null, translationLang: null })
useStorage('settings', settings, undefined,
  {
    serializer: {
      read: (v) => v ? JSON.parse(v) : null,
      write: (v) => JSON.stringify(v),
    },
  })
const userSettings = ref(null)
useStorage('userSettings', userSettings, undefined,
  {
    serializer: {
      read: (v) => new Map(JSON.parse(v)),
      write: (v) => v instanceof Map ? JSON.stringify([...v]) : JSON.stringify(v)
    },
  })

const getColor = computed(() => (key) => userSettings.value.has(key) ? userSettings.value.get(key).color : null);

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
    store.dispatch('doSetTranslationLang', settings.value.translationLang);
    store.dispatch('doSetTranslationApiKey', settings.value.translationApiKey);
    if (!logins.value) {
      add()
    }
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

    if (userSettings.value && userSettings.value.has(loginResponse.res.did)) {
      store.dispatch('doSetColor', userSettings.value.get(loginResponse.res.did).color);
    }

    const profileResponse = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    store.dispatch('doSetProfile', profileResponse.res);
    logins.value[tab.value].avatar = profileResponse.res.avatar

    storageLogins.value = logins.value

    while (!completed.value) {
      await getFollows(handle, followsCursor)
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
    console.log(e)
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
  const response = await requestGet.get("app.bsky.graph.getFollows", params)
  followsCursor.value = response.res.cursor
  if (response.res.follows.length == 0) {
    completed.value = true
    return
  }
  store.dispatch('doAddFollows', response.res)
}

const getMutes = async (cur) => {
  let params = {}
  if (!cur.value) {
    params = {}
  } else {
    params = { cursor: cur.value }
  }
  const response = await requestGet.get("app.bsky.graph.getMutes", params)
  mutesCursor.value = response.res.cursor
  if (response.res.mutes.length == 0) {
    completed.value = true
    return
  }
  store.dispatch('doAddMutes', response.res)
}

const getBlocks = async (cur) => {
  let params = {}
  if (!cur.value) {
    params = {}
  } else {
    params = { cursor: cur.value }
  }
  const response = await requestGet.get("app.bsky.graph.getBlocks", params)
  blocksCursor.value = response.res.cursor
  if (response.res.blocks.length == 0) {
    completed.value = true
    return
  }
  console.log(response.res)
  store.dispatch('doAddBlocks', response.res)
}
</script>
