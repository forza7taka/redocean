<template>
  <div class="displayArea mx-auto">
    <v-card class="mx-auto pa-4" variant="flat">
      <template v-if="settings">
        <v-card-title>
          TitleBar Color
        </v-card-title>
        <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
          swatches-max-height="210" v-model=settings.color></v-color-picker>
      </template>
    </v-card>
    <template v-for="(l, index) in labelItems" :key="index">
      <v-card class="mx-auto pa-4" variant="flat">
        <v-card-title>
          {{ l.name }}
        </v-card-title>
        <v-card-subtitle>
          {{ l.discription }}
        </v-card-subtitle>
        <v-card-text>
          <template v-if="settings && settings.labels">
            <v-btn-toggle justify="center" v-model="settings.labels[index]" color="primary">
              <v-btn icon="mdi-image-off-outline"></v-btn>
              <v-btn icon="mdi-alert-octagon"></v-btn>
              <v-btn icon="mdi-image-outline"></v-btn>
            </v-btn-toggle>
          </template>
        </v-card-text>
      </v-card>
      <v-divider />
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute } from "vue-router"
import { useStorage } from '@vueuse/core'

const route = useRoute()
const userSettings = ref(new Map())
const storageUserSettings = useStorage("userSettings", userSettings, undefined,
  {
    serializer: {
      read: (v) => new Map(JSON.parse(v)),
      write: (v) => v instanceof Map ? JSON.stringify([...v]) : JSON.stringify(v)
    }
  }
)
const settings = ref(null)

const labelItems = ref([{ name: 'porn', value: "porn", discription: "sexual activity/animal genitalia and human" },
{ name: 'nudity', value: "nudity", discription: "male nudity/female nudity" },
{ name: 'sexual', value: "sexual", discription: "general suggestive" },
{ name: 'gore', value: "gore", discription: "very bloody" },
{ name: 'corpse', value: "corpse", discription: "human corpse" },
{ name: 'self-harm', value: "self-harm", discription: "self harm" },
{ name: 'icon-nazi', value: "icon-nazi", discription: "nazi" },
{ name: 'icon-kkk', value: "icon-kkk", discription: "kkk" },
{ name: 'icon-confederate', value: "icon-confederate", discription: "confederate" }
])

onBeforeMount(async () => {
  console.log(userSettings.value)
  if (userSettings.value.has(route.params.did)) {
    settings.value = userSettings.value.get(route.params.did)
  } else {
    settings.value = { labels: [], color: null }
    settings.value.labels = new Array()
    labelItems.value.forEach(() => {
      settings.value.labels.push(0)
    })
  }
});

watch(() => settings, () => {
  userSettings.value.set(route.params.did, settings.value)
  storageUserSettings.value = userSettings.value
}, { deep: true }
);
</script>