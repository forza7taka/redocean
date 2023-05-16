<template>
  <div class="displayArea mx-auto">
    <v-card>
      <v-card-text>
        <v-text-field label="Google Cloud Translation API Key" color="green darken-5" clearable dense
          v-model="cloudTranslationApiKey"></v-text-field>
      </v-card-text>
      <v-card-text>
        <v-text-field label="Google Cloud Translation API Key" color="green darken-5" clearable dense
          v-model="cloudTranslationApiKey"></v-text-field>
        </v-card-text>
      <v-card-actions>
        <v-btn icon @click="update"><v-icon>mdi-content-save</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useStorage } from '@vueuse/core'
import { useStore } from 'vuex'

const store = useStore();
const cloudTranslationApiKey = ref(null)
const storageCloudTranslationApiKey = useStorage('storageCloudTranslationApiKey', cloudTranslationApiKey)

onBeforeMount(async () => {
  cloudTranslationApiKey.value = storageCloudTranslationApiKey.value
})

const update = async () => {
  storageCloudTranslationApiKey.value = cloudTranslationApiKey.value
  store.dispatch('doSetCloudTranslationApiKey', cloudTranslationApiKey.value);

}
</script>