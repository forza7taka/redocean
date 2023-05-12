<template>
  <div class="displayArea mx-auto">
    <v-card>
      <v-card-text>
        <v-card class="mx-auto pa-4">
          <v-text-field label="Google Cloud Translation API" color="green darken-5" clearable dense
            v-model="cloudTranslationApiKey"></v-text-field>
        </v-card>

        <v-card class="mx-auto pa-4">
          <v-btn-toggle v-model="toggle" color="primary">
            <v-btn icon="mdi-format-align-left"></v-btn>
            <v-btn icon="mdi-format-align-center"></v-btn>
            <v-btn icon="mdi-format-align-right"></v-btn>
            <v-btn icon="mdi-format-align-justify"></v-btn>
          </v-btn-toggle>
        </v-card>
        <!-- yes_sexual_activity: 'porn',
    animal_genitalia_and_human: 'porn', // for some reason not included in 'yes_sexual_activity'
    yes_male_nudity: 'nudity',
    yes_female_nudity: 'nudity',
    general_suggestive: 'sexual',
    very_bloody: 'gore',
    human_corpse: 'corpse',
    yes_self_harm: 'self-harm',
    yes_nazi: 'icon-nazi',
    yes_kkk: 'icon-kkk',
    yes_confederate: 'icon-confederate', -->





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