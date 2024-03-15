<template>
  <div class="displayArea mx-auto">
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
                    :items="['https://bsky.social', 'https://boobee.blue', 'https://redocean.one']"
                    :label="$t('login.server')" placeholder="https://bsky.social" color="green darken-5" clearable dense
                    variant="outlined"></v-combobox>
                  <v-text-field label="xxxx.bsky.social" placeholder="xxxx.bsky.social" color="green darken-5" clearable
                    dense v-model="l.handle" variant="outlined"></v-text-field>
                  <v-text-field :label="$t('login.appPassword')" placeholder="app password" color="green darken-5"
                    clearable dense type="password" v-model="l.password" :rules="AppPasswordRules"
                    variant="outlined"></v-text-field>
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
                  &nbsp;
                  <template v-if="l.server && l.handle && index != 0">
                    <v-btn size="42" icon="mdi-arrow-left" @click="left(index)"></v-btn>
                    &nbsp;
                  </template>
                  <template v-if="l.server && l.handle && index != settings.users.length - 1">
                    <v-btn size="42" icon="mdi-arrow-right" @click="right(index)"></v-btn>
                  </template>
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

import { ref, watch, onBeforeMount, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'
import { useRouter } from "vue-router"
import { useStorage } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';
import { useSettings } from '@/common/settings'
import { useParseSettings } from "@/common/parseSettings"
import { Setting } from "@/common/setting"

const parseSettings = useParseSettings()

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

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)

const passwords = ref(new Array({ did: null, password: null }))
const storagePasswords = useStorage('passwords', passwords)

const settings1 = ref(null)
const settings2 = ref(null)
const settings3 = ref(null)

const storageSettings1 = useStorage('settings', settings1)
const storageSettings2 = useStorage('userSettings', settings2)
const storageSettings3 = useStorage('logins', settings3)

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

const right = async (index) => {
  const user1 = settings.value.users[index]
  const user2 = settings.value.users[index + 1]
  settings.value.users[index + 1] = user1
  settings.value.users[index] = user2
  tab.value = index + 1
}
const left = async (index) => {
  const user1 = settings.value.users[index]
  const user2 = settings.value.users[index - 1]
  settings.value.users[index - 1] = user1
  settings.value.users[index] = user2
  tab.value = index - 1

}

onBeforeMount(async () => {
  try {
    if (settings1.value) {
      const value = JSON.parse(settings1.value)
      settings.value.translationApiKey = value.translationApiKey
      settings.value.translationLang = value.translationLang
      settings.value.handed = value.handed
    }
    storageSettings1.value = null
    if (settings3.value) {
      const value = JSON.parse(settings3.value)
      settings.value.users = value
    }
    storageSettings3.value = null
    if (settings2.value) {
      const value = JSON.parse(settings2.value)
      for (let i = 0; i < value.length; i++) {
        for (let j = 0; j < settings.value.users.length; j++) {
          if (settings.value.users[j].did == value[i][0]) {
            settings.value.users[j].color = value[i][1].color
          }
        }
      }
    }
    storageSettings2.value = null

    for (let i = 0; i < settings.value.users.length; i++) {
      const user = settings.value.users[i]
      if (user.password) {
        continue
      }
      for (let j = 0; j < passwords.value.length; j++) {
        const password = passwords[j]
        if (user.did == password.did)
          user.password = password.password
      }
    }

    store.dispatch('doSetHanded', settings.value.handed)
  } catch (e) {
    failed.value = true
    const ce = useCatchError()
    ce.catchError(e)
  }
})

onUnmounted(async () => {
  parseSettings.upload()
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
  if (response.res.mutes.length == 0) {
    completed.value = true
    return
  }
  if (mutesCursor.value === response.res.cursor) {
    completed.value = true
    return
  }
  mutesCursor.value = response.res.cursor
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

  if (response.res.blocks.length == 0) {
    completed.value = true
    return
  }
  if (blocksCursor.value === response.res.cursor) {
    completed.value = true
    return
  }
  blocksCursor.value = response.res.cursor
  store.dispatch('doAddBlocks', response.res)
}

watch(
  () => settings,
  async () => {
    storageSettings.value = settings.value
    let passwords = new Array()
    for (let i = 0; i < settings.value.users.length; i++) {
      let user = settings.value.users[i]
      passwords.push({ did: user.did, password: user.password })
    }
    storagePasswords.value = passwords
  }, { deep: true }
)

watch(
  () => tab.value,
  async () => {
    const did = settings.value.users[tab.value].did
    const handle = settings.value.users[tab.value].handle
    store.dispatch('doSetColor', await settingsManager.getColor(did, handle));
  }
)

</script>
