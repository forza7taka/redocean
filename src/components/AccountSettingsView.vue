<template>
  <div class="displayArea mx-auto">
    <template v-if="settings">
    <v-color-picker disabled hide-canvas hide-inputs hide-mode-switch hide-sliders mode="rgba" show-swatches
      swatches-max-height="210" v-model=settings.color></v-color-picker>
    </template>
    <template v-for="(l, index) in labelItems" :key="index">
      <v-card class="mx-auto pa-4">
        <v-card-subtitle>
          {{ l.name }}:{{ l.discription }}
        </v-card-subtitle>
        <template v-if="settings && settings.labels">
          <v-btn-toggle v-model="settings.labels[index]" color="primary">
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
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute } from "vue-router"
import { useStorage } from '@vueuse/core'

const route = useRoute()
const userSettings = ref(new Map())
const strangeUserSettings = useStorage("userSettings", userSettings, undefined,
  {
    serializer: {
      read: (v) => v ? new Map(Object.entries(JSON.parse(v))) : null,
      write: (v) => JSON.stringify(v),
    },
  })
const settings = ref(null)

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
  settings.value = userSettings.value.get(route.params.did)
  if (!settings.value) {
    settings.value = {labels:[], color: null}
    settings.value.labels = new Array()
    labelItems.value.forEach(() => {
      settings.value.labels.push(0)
    })
  }
});

watch(
  // 監視対象のデータ
  () => settings.value,

  // 変更があった場合に実行されるコールバック関数
  () => {
  userSettings.value.set(route.params.did, settings.value);
  strangeUserSettings.value = new Map(userSettings.value);
  }
);
</script>