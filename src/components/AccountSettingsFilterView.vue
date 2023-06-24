<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Filter Settings"></v-toolbar>
    <template v-if="userSettings">
      <template v-for="(label, index) in userSettings.labels" :key="index">
        <template v-if="label.name">
          <v-toolbar :title="label.name">{{ label.value }}</v-toolbar>
        </template>
        <template v-else>
        <v-card class="mx-auto pa-4" variant="flat">
          <v-toolbar :title="label.id"></v-toolbar>
          <v-card-text>
            <v-btn-toggle v-model="label.value" justify="center" color="blue">
              <v-btn value="filter" icon="mdi-image-off-outline"></v-btn>
              <v-btn value="warn" icon="mdi-alert-octagon"></v-btn>
              <v-btn value="show" icon="mdi-image-outline"></v-btn>
            </v-btn-toggle>
          </v-card-text>
        </v-card>
        </template>
        <v-divider></v-divider>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useSettings } from '@/common/settings'
import { useParseSettings } from "@/common/parseSettings"
import { Setting } from "@/common/setting"

const parseSettings = useParseSettings()

const illegalLabelItems = [
  { name: "Illegal", value: 'Illegal Content' },
  { id: "csam", value: 'filter' },
  { id: 'dmca-violation', value: 'filter' },
  { id: 'nudity-nonconsensual', value: 'filter' },
]
const alwaysFilterLabelItems = [
  { name: "always-filter", value: 'ContentWarning' },
  { id: '!filter', value: 'filter' },
]
const alwaysWarnLabelItems = [
  { name: "always-warn", value: 'Content Warning' },
   { id: '!warn', value: 'filter' },
  { id: 'account-security', value: 'filter' },
]
const nsfwLabelItems = [
  { name: "nsfw", value: 'Explicit Sexual Images' },
  { id: 'porn', value: 'filter' },
  { id: 'nsfl', value: 'filter' },
]
const nudityLabelItems = [
  { name: "nudity", value: 'Other Nudity' },
  { id: 'nudity', value: 'filter' },
]
const suggestiveLabelItems = [
  { name: "suggestive", value: 'Sexually Suggestive' },
  { id: 'sexual', value: 'filter' },
]
const goreLabelItems = [
  { name: "gore", value: 'Violent / Bloody' },
  { id: 'gore', value: 'filter' },
  { id: 'self-harm', value: 'filter' },
  { id: 'torture', value: 'filter' },
  { id: 'nsfl', value: 'filter' },
  { id: 'corpse', value: 'filter' },
]
const hateLabelItems = [
  { name: "hate", value: 'Political Hate-Groups' }, 
  { id: 'icon-kkk', value: 'filter' },
  { id: 'icon-nazi', value: 'filter' },
  { id: 'icon-intolerant', value: 'filter' },
  { id: 'behavior-intolerant', value: 'filter' },
]
const spamLabelItems = [
  { name: "spam", value: 'Spam' },
  { id: 'spam', value: 'filter' },
]
const impersonationLabelItems = [
  { name: "Illegal", value: 'Impersonation' },
  { id: 'impersonation', value: 'filter' }
]
const route = useRoute()

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

const labelItems = ref(new Array)

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
  
  for (let i = 0; i < illegalLabelItems.length; i++) {
    labelItems.value.push(illegalLabelItems[i])
  }
    for (let i = 0; i < alwaysFilterLabelItems.length; i++) {
    labelItems.value.push(alwaysFilterLabelItems[i])
  }
    for (let i = 0; i < alwaysWarnLabelItems.length; i++) {
    labelItems.value.push(alwaysWarnLabelItems[i])
  }
    for (let i = 0; i < nsfwLabelItems.length; i++) {
    labelItems.value.push(nsfwLabelItems[i])
  }
    for (let i = 0; i < nudityLabelItems.length ; i++) {
    labelItems.value.push(nudityLabelItems[i])
  }
    for (let i = 0; i < suggestiveLabelItems.length; i++) {
    labelItems.value.push(suggestiveLabelItems[i])
  }
  for (let i = 0; i < goreLabelItems.length; i++) {
    labelItems.value.push(goreLabelItems[i])
  }
  for (let i = 0; i < hateLabelItems.length; i++) {
    labelItems.value.push(hateLabelItems[i])
  }
  for (let i = 0; i < spamLabelItems.length; i++) {
    labelItems.value.push(spamLabelItems[i])
  }
  for (let i = 0; i < hateLabelItems.length; i++) {
    labelItems.value.push(hateLabelItems[i])
  }
  for (let i = 0; i < impersonationLabelItems.length; i++) {
    labelItems.value.push(impersonationLabelItems[i])
  }
    
  if (!userSettings.value.labels || userSettings.value.labels.length == 0) {
    userSettings.value.labels = labelItems.value
    return
  }
  for (let i = 0; i < labelItems.value.length; i++) {
    const label = labelItems.value[i]
    if (label.name) {
      continue
    }
    console.log(label.id)
    for (let j = 0; j < userSettings.value.labels.length; j++) {
      const userLabel = userSettings.value.labels[j]
      if (label.id == userLabel.id ) {
        label.value = userLabel.value
        break
      }
    }
  }
  userSettings.value.labels = labelItems.value
});

onUnmounted(async () => {
  parseSettings.upload()
})

watch(() => userSettings, () => {
  for (let i = 0; i < settings.value.users.length; i++) {
    const user = settings.value.users[i]
    if (route.params.did == user.did) {
      storageSettings.value.users[i].labels = userSettings.value.labels
    }
  }
}, { deep: true }
);

</script>