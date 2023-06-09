<template>
  <div class="displayArea">
    <v-card>
      <v-card-text>
        <v-tabs v-model="tab">
          <div v-for="(l, index) in settings.users" :key="index" :value=index>
            <v-tab :value=index>
              <template v-if="l.avatar">
                <template v-if="l.color">
                  <v-avatar v-if="l.color" :style="`border: 5px solid ${l.color};`">
                    <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
                  </v-avatar>
                </template>
                <template v-else>
                  <v-avatar>
                    <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
                  </v-avatar>
                </template>
              </template>
              <template v-if="!l.avatar && l.handle">
                {{ l.handle }}
              </template>
              <template v-if="!l.avatar && !l.handle">
                New Account
              </template>
            </v-tab>
          </div>
        </v-tabs>

        <v-card-text>
          <v-window v-model="tab">
            <div v-for="(l, index) in settings.users" :key="index" :value=index>
              <v-window-item :value=index>
                <v-card class="mx-auto pa-4">
                  <v-combobox v-model="l.server"
                    :items="['https://bsky.social', 'https://boobee.blue', 'https://redocean.one']" label="server"
                    placeholder="https://bsky.social" color="green darken-5" clearable dense
                    variant="outlined"></v-combobox>
                  <v-text-field label="xxxx.bsky.social" placeholder="xxxx.bsky.social" color="green darken-5" clearable
                    dense v-model="l.handle" variant="outlined"></v-text-field>
                  <v-text-field label="app password" placeholder="app password" color="green darken-5" clearable dense
                    type="password" v-model="l.password" :rules="AppPasswordRules" variant="outlined"></v-text-field>
                  <br>
                  <v-btn @click.prevent="login(index, l.server, l.handle, l.password)" icon="mdi-login" size="42"
                    :disabled="!(l.server && l.handle && l.password)"></v-btn>
                  &nbsp;
                  <v-btn :to="`/accountSetting/${l.did}/${l.handle}`" icon="mdi-cog-outline" size="42"
                    :disabled="!l.did"></v-btn>
                  &nbsp;
                  <v-btn v-if="settings.users.length > 1" @click="del(index)" icon="mdi-minus" size="42"></v-btn>
                  &nbsp;
                  <v-btn v-if="l.server && l.handle && l.password && index == settings.users.length - 1"
                    @click="add(index)" size="42" icon="mdi-plus"></v-btn>
                </v-card>
              </v-window-item>
            </div>
          </v-window>
        </v-card-text>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>

import { ref, watch, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'
import { useRouter } from "vue-router"
import { useStorage } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';
import { useSettings } from '@/common/settings'

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

const user = ref([{ did: null, server: null, handle: null, avatar: null, color: null, labels: null }])
const settings = ref({
  userID: null,
  translationApiKey: null,
  translationLang: null,
  handed: true,
  users: user
})


const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)

const settings1 = useStorage('settings')
const settings2 = useStorage('userSettings')
const settings3 = useStorage('logins')

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

const add = async (index) => {
  const user = { did: null, server: null, handle: null, avatar: null, labels: null, color: null }
  settings.value.users.push(user)
  tab.value = index + 1
}
const del = async (index) => {
  settings.value.users.splice(index, 1)
  tab.value = index - 1
}

onBeforeMount(async () => {
  try {
    settings1.value = null
    settings2.value = null
    settings3.value = null
    store.dispatch('doSetHanded', settings.value.handed)
  } catch (e) {
    failed.value = true
    const ce = useCatchError()
    ce.catchError(e)
  }
})

const login = async (index, server, handle, password) => {
  failed.value = false
  try {
    store.dispatch('doSetServer', server)
    const login = await requestPost.post("com.atproto.server.createSession", {
      identifier: handle,
      password: password
    })
    store.dispatch('doCreateSession', login.res);
    store.dispatch('doSetColor', await settingsManager.getColor(login.res.did, login.res.handle));

    const profile = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    store.dispatch('doSetProfile', profile.res);
    settings.value.users[index].did = login.res.did
    settings.value.users[index].handle = login.res.handle
    settings.value.users[index].avatar = profile.res.avatar

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
  store.dispatch('doAddBlocks', response.res)
}

watch(
  () => settings,
  async () => {
    storageSettings.value = settings.value
  }, { deep: true }
)
</script>
