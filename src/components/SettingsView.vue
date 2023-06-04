<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="Settings"></v-toolbar>
    <v-card>
      <v-card-text>
        <v-text-field label="Google Cloud Translation API Key" color="green darken-5" clearable dense
          v-model="settings.translationApiKey" variant="outlined"></v-text-field>
        <v-combobox v-model="settings.translationLang" :items="['ja', 'en']" label="language" placeholder="en"
          color="green darken-5" clearable dense variant="outlined"></v-combobox>
      </v-card-text>
      <v-card-text>
        Dominant Hand
        <template v-if="settings.handed">
          <v-switch v-model="settings.handed" label="Right-handed"></v-switch>
        </template>
        <template v-else>
          <v-switch v-model="settings.handed" label="Left-handed"></v-switch>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useStorage } from '@vueuse/core'
import { useStore } from 'vuex'

const settings = ref({ translationApiKey: null, translationLang: null, handed: true })
const store = useStore();
const storageSettings = useStorage('settings', settings)

onBeforeMount(async () => {
  settings.value.translationApiKey = storageSettings.value.translationApiKey
  settings.value.translationLang = storageSettings.value.translationLang
  settings.value.handed = storageSettings.value.handed
})

watch(
  () => settings,
  async () => {
    storageSettings.value = settings.value
    store.dispatch('doSetTranslationLang', storageSettings.value.translationLang);
    store.dispatch('doSetTranslationApiKey', storageSettings.value.translationApiKey);
    store.dispatch('doSetHanded', storageSettings.value.handed);
  }, { deep: true }
)
</script>