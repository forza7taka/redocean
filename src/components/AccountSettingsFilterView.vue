<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Filter Settings"></v-toolbar>
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

const route = useRoute()

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
  if (!userSettings.value.labels || userSettings.value.labels.length == 0) {
    userSettings.value.labels = labelItems
    return
  }
});

onUnmounted(async () => {
  parseSettings.upload()
})

watch(() => userSettings, () => {
  for (let i = 0; i < settings.value.users.length; i++) {
    const user = settings.value.users[i]
    if (route.params.did == user.did) {
      // storageSettings.value.users[i].color = userSettings.value.color
      storageSettings.value.users[i].labels = userSettings.value.labels
      // storageSettings.value.users[i].push = userSettings.value.push
    }
  }
}, { deep: true }
);

</script>