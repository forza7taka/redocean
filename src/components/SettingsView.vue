<template>
  <div class="displayArea mx-auto">
    <v-toolbar :title="$t('settings.settings')"></v-toolbar>
    <v-card>
        <!-- <v-card-text>
          <v-combobox v-model="i18n.locale" :items="['ja', 'en']" :label="$t('settings.language')" placeholder="en"
              color="green darken-5" clearable dense variant="outlined"></v-combobox>
        </v-card-text> -->
      <v-card-text>
        <v-text-field :label="$t('settings.GoogleCloudTranslationAPIKey')" color="green darken-5" clearable dense
          v-model="settings.translationApiKey" variant="outlined"></v-text-field>
        <v-combobox v-model="settings.translationLang" :items="['ja', 'en']" :label="$t('settings.language')" placeholder="en"
          color="green darken-5" clearable dense variant="outlined"></v-combobox>
      </v-card-text>
      <v-card-text>
        {{$t('settings.dominantHand') }}
        <template v-if="settings.handed">
          <v-switch v-model="settings.handed" :label="$t('settings.rightHanded')"></v-switch>
        </template>
        <template v-else>
          <v-switch v-model="settings.handed" :label="$t('settings.leftHanded')"></v-switch>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useParseSettings } from "@/common/parseSettings"
import { Setting } from "@/common/setting"
const parseSettings = useParseSettings()
const settings = ref(new Setting())
const storageSettings = useStorage('redocean', settings)

onUnmounted(async () => {
  parseSettings.upload()
})

watch(
  () => settings,
  async () => {
    storageSettings.value = settings.value
  }, { deep: true }
)

</script>