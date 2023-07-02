<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Account Settings"></v-toolbar>
    <v-card class="mx-auto pa-4" variant="flat">
      <template v-if="userSettings">
        <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
          swatches-max-height="210" v-model=userSettings.color></v-color-picker>
      </template>
    </v-card>
    <v-divider></v-divider>
    <v-card class="mx-auto pa-4" variant="flat">
        <template v-if="userSettings">
        <v-combobox v-model="userSettings.langs[0]"
                      :items="['ja', 'en']"
                      label="langs" color="green darken-5" clearable dense
                      variant="outlined"></v-combobox>
        <v-combobox v-model="userSettings.langs[1]"
                      :items="['ja', 'en']"
                      label="langs" color="green darken-5" clearable dense
                      variant="outlined"></v-combobox>
        <v-combobox v-model="userSettings.langs[2]"
                      :items="['ja', 'en']"
                      label="langs" color="green darken-5" clearable dense
                      variant="outlined"></v-combobox>
        </template>
    </v-card>
    <v-divider></v-divider>
    <v-card class="mx-auto pa-4" variant="flat">
      <v-btn :to="`/accountSettingsPush/${route.params.did}/${route.params.handle}`">Push Notification</v-btn>
    </v-card>
    <v-divider></v-divider>
    <v-card class="mx-auto pa-4" variant="flat">
      <v-btn :to="`/accountSettingsFilter/${route.params.did}/${route.params.handle}`">Filter</v-btn>
    </v-card>
    <v-divider></v-divider>
    <v-card class="mx-auto pa-4" variant="flat">
      <v-btn :to="`/accountSettingsMuteWords/${route.params.did}/${route.params.handle}`">Mute Words</v-btn>
    </v-card>
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

const store = useStore()
const route = useRoute()

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
  if (!userSettings.value.langs) {
    userSettings.value.langs = ["","",""]
  }
});

onUnmounted(async () => {
  parseSettings.upload()
})

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