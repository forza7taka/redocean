<template>
  <div class="displayArea mx-auto">
    <v-card>
      <v-card-text>
        <v-text-field label="Google Cloud Translation API Key" color="green darken-5" clearable dense
          v-model="settings.translationApiKey" variant="outlined"></v-text-field>
        <v-combobox v-model="settings.translationLang" :items="['ja', 'en']" label="language" placeholder="en"
          color="green darken-5" clearable dense variant="outlined"></v-combobox>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useStorage } from '@vueuse/core'
import { useStore } from 'vuex'

const settings = ref({ translationApiKey: null, translationLang: null })
const store = useStore();
const storageSettings = useStorage('settings', settings)

onBeforeMount(async () => {
  settings.value.translationApiKey = storageSettings.value.translationApiKey
})
watch(
  () => settings,
  async () => {
    storageSettings.value = settings.value
    store.dispatch('doSetTranslationLang', storageSettings.value.translationLang);
    store.dispatch('doSetTranslationApiKey', storageSettings.value.translationApiKey);
  }, { deep: true }
)
</script>