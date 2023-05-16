<template>
  <div class="displayArea mx-auto">
    <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
      swatches-max-height="210" v-model=userSettings.color></v-color-picker>
    <template v-for="(l, index) in labelItems" :key="index">
      <v-card class="mx-auto pa-4">
        <v-card-subtitle>
          {{ l.name }}:{{ l.discription }}
        </v-card-subtitle>
        <template v-if="userSettings && userSettings.labels">
          <v-btn-toggle v-model="userSettings.labels[index]" color="primary">
            <v-btn icon="mdi-image-off-outline"></v-btn>
            <v-btn icon="mdi-alert-octagon"></v-btn>
            <v-btn icon="mdi-image-outline"></v-btn>
          </v-btn-toggle>
        </template>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { ref, watchEffect, onBeforeMount } from 'vue'
import { useRoute } from "vue-router"
import { useStorage } from '@vueuse/core'

const route = useRoute()
const userSettings = ref({ labels: null, color: null })
const storageUserSettings = useStorage(route.params.did, userSettings)

const labelItems = ref([{ name: 'porn', value: "porn", discription: "sexual activity/animal genitalia and human" },
{ name: 'nudity', value: "nudity", discription: "male nudity/female nudity" },
{ name: 'sexual', value: "sexual", discription: "general suggestive" },
{ name: 'gore', value: "gore", discription: "very bloody" },
{ name: 'corpse', value: "corpse", discription: "human corpse" },
{ name: 'self-harm', value: "self-harm", discription: "self_harm" },
{ name: 'icon-nazi', value: "icon-nazi", discription: "nazi" },
{ name: 'icon-kkk', value: "icon-kkk", discription: "kkk" },
{ name: 'icon-confederate', value: "icon-confederate", discription: "confederate" }
])

onBeforeMount(async () => {
  if (!userSettings.value.labels) {
    userSettings.value.labels = new Array()
    labelItems.value.forEach(() => {
      userSettings.value.labels.push(0)
    })
  }
});

watchEffect(() => {
  storageUserSettings.value = userSettings.value
});

</script>