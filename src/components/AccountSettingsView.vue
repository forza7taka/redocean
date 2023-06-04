<template>
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
        <template v-if="settings">
          <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
            swatches-max-height="210" v-model=settings.color></v-color-picker>
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
      <template v-for="(label, index) in settings.labels" :key="index">
        <v-card class="mx-auto pa-4" variant="flat">
          <v-toolbar :title="label.id"></v-toolbar>
          <v-card-text>
            <template v-if="settings && settings.labels">
              <v-btn-toggle v-model="label.value" justify="center" color="primary">
                <v-btn value="filter" icon="mdi-image-off-outline"></v-btn>
                <v-btn value="warn" icon="mdi-alert-octagon"></v-btn>
                <v-btn value="show" icon="mdi-image-outline"></v-btn>
              </v-btn-toggle>
            </template>
          </v-card-text>
        </v-card>
        <v-divider />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute } from "vue-router"
import { useStorage } from '@vueuse/core'
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

const route = useRoute()
const userSettings = ref(new Map([[route.params.did, { labels: null, color: null }]]))
const storageUserSettings = useStorage("userSettings", userSettings)

const settings = ref(null)

onBeforeMount(async () => {
  if (userSettings.value.has(route.params.did)) {
    settings.value = userSettings.value.get(route.params.did)
    if (settings.value.labels == null) {
      settings.value.labels = labelItems
    }
  } else {
    settings.value = { labels: labelItems, color: null }
  }
});

watch(() => settings, () => {
  userSettings.value.set(route.params.did, settings.value)
  storageUserSettings.value = userSettings.value
}, { deep: true }
);
</script>