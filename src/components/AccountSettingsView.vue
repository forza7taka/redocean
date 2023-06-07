<template>
  {{ userSettings.color }}
  {{ userSettings.labels }}

  <div class="displayArea mx-auto">
    <v-toolbar title="Account Settings"></v-toolbar>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, } from 'vue'
import { useStorage } from '@vueuse/core'
import { useStore } from 'vuex'
import { useSettings } from '@/common/settings'

const isShowTitleBarColor = ref(true)
const isShowfilter = ref(true)
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
  { id: 'nsfl', value: 'filter' },
  { id: 'icon-kkk', value: 'filter' },
  { id: 'icon-nazi', value: 'filter' },
  { id: 'icon-intolerant', value: 'filter' },
  { id: 'behavior-intolerant', value: 'filter' },
  { id: 'spam', value: 'filter' },
  { id: 'impersonation', value: 'filter' }]

const store = useStore()
const settings = ref({
  userID: null,
  translationApiKey: null,
  translationLang: null,
  handed: true,
  users: [{ did: null, server: null, handle: null, avatar: null, color: null, labels: null }]
})
const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
let userSettings = await settingsManager.getUser(store.getters.getDid, store.getters.getHandle)

onBeforeMount(async () => {
  if (!userSettings.labels) {
    userSettings.labels = labelItems
    return
  }
});

watch(() => settings, () => {
  storageSettings.value = settings.value
}, { deep: true }
);
</script>