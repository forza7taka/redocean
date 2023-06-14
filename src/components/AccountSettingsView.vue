<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Account Settings"></v-toolbar>
    <div v-if="isPushNotification" @click="isPushNotification = !isPushNotification">
      <v-toolbar title="Push Notification">hide</v-toolbar>
    </div>
    <div v-if="!isPushNotification" @click="isPushNotification = !isPushNotification">
      <v-toolbar title="Push Notification">show</v-toolbar>
    </div>
    <div v-show="isPushNotification">
      <v-card class="mx-auto pa-4" variant="flat">
        <template v-if="userSettings && userSettings.push">
          <v-switch v-model="userSettings.push.enable" label="Push Notification"
            @change="changeEnablePushNotification"></v-switch>
          <v-switch v-model="userSettings.push.enableFollowed" label="Followed Push Notification"></v-switch>
          <v-switch v-model="userSettings.push.enableReposted" label="Reposted Push Notification"></v-switch>
          <v-switch v-model="userSettings.push.enableReplied" label="Replied Push Notification"></v-switch>
          <v-switch v-model="userSettings.push.enableLiked" label="Liked Push Notification"></v-switch>
          <v-switch v-model="userSettings.push.enableMention" label="Mention Push Notification"></v-switch>
        </template>
      </v-card>
    </div>
    <div v-if="isShowTitleBarColor" @click="isShowTitleBarColor = !isShowTitleBarColor">
      <v-toolbar title="TitleBarColor">hide</v-toolbar>
    </div>
    <div v-if="!isShowTitleBarColor" @click="isShowTitleBarColor = !isShowTitleBarColor">
      <v-toolbar title="TitleBarColor">show</v-toolbar>
    </div>
    <div v-show="isShowTitleBarColor">
      <v-card class="mx-auto pa-4" variant="flat">
        <template v-if="userSettings">
          <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
            swatches-max-height="210" v-model=userSettings.color></v-color-picker>
        </template>
      </v-card>
    </div>
    <div v-if="isShowfilter" @click="isShowfilter = !isShowfilter">
      <v-toolbar title="Filter">hide</v-toolbar>
    </div>
    <div v-if="!isShowfilter" @click="isShowfilter = !isShowfilter">
      <v-toolbar title="Filter">show</v-toolbar>
    </div>
    <div v-show="isShowfilter">
      <template v-if="userSettings">
        <template v-for="(label, index) in userSettings.labels" :key="index">
          <v-card class="mx-auto pa-4" variant="flat">
            <v-toolbar :title="label.id"></v-toolbar>
            <v-card-text>
              <v-btn-toggle v-model="label.value" justify="center" color="primary">
                <v-btn value="filter" icon="mdi-image-off-outline"></v-btn>
                <v-btn value="warn" icon="mdi-alert-octagon"></v-btn>
                <v-btn value="show" icon="mdi-image-outline"></v-btn>
              </v-btn-toggle>
            </v-card-text>
          </v-card>
          <v-divider />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useSettings } from '@/common/settings'
import { useParseSettings } from "@/common/parseSettings"
import { Setting } from "@/common/setting"

const parseSettings = useParseSettings()

const isShowTitleBarColor = ref(true)
const isShowfilter = ref(true)
const isPushNotification = ref(true)
const labelItems = [
  { id: "csam", value: 'filter' },
  { id: 'dmca-violation', value: 'filter' },
  { id: 'nudity-nonconsensual', value: 'filter' },
  { id: '!filter', value: 'filter' },
  { id: '!warn', value: 'filter' },
  { id: 'account-security', value: 'filter' },
  { id: 'porn', value: 'filter' },
  { id: 'nsfl', value: 'filter' },
  { id: 'nudity', value: 'filter' },
  { id: 'sexual', value: 'filter' },
  { id: 'gore', value: 'filter' },
  { id: 'self-harm', value: 'filter' },
  { id: 'torture', value: 'filter' },
  { id: 'icon-kkk', value: 'filter' },
  { id: 'icon-nazi', value: 'filter' },
  { id: 'icon-intolerant', value: 'filter' },
  { id: 'behavior-intolerant', value: 'filter' },
  { id: 'spam', value: 'filter' },
  { id: 'impersonation', value: 'filter' }]

const store = useStore()
const route = useRoute()

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
  if (!userSettings.value.labels) {
    userSettings.value.labels = labelItems
    return
  }
  if (!userSettings.value.push) {
    userSettings.value.push = {}
    return
  }
});

onUnmounted(async () => {
  parseSettings.upload()
})

const changeEnablePushNotification = async () => {
  userSettings.value.push.enableFollowed = userSettings.value.push.enable
  userSettings.value.push.enableReposted = userSettings.value.push.enable
  userSettings.value.push.enableReplied = userSettings.value.push.enable
  userSettings.value.push.enableLiked = userSettings.value.push.enable
  userSettings.value.push.enableMention = userSettings.value.push.enable
  for (let i = 0; i < settings.value.users.length; i++) {
    const user = settings.value.users[i]
    if (route.params.did == user.did) {
      storageSettings.value.users[i].color = userSettings.value.color
      storageSettings.value.users[i].labels = userSettings.value.labels
    }
  }
}


watch(() => userSettings, () => {
  store.dispatch('doSetColor', userSettings.value.color)
  for (let i = 0; i < settings.value.users.length; i++) {
    const user = settings.value.users[i]
    if (route.params.did == user.did) {
      storageSettings.value.users[i].color = userSettings.value.color
      storageSettings.value.users[i].labels = userSettings.value.labels
      storageSettings.value.users[i].push = userSettings.value.push
    }
  }
}, { deep: true }
);

</script>