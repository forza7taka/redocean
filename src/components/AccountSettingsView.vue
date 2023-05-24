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
    <template v-for="[key] in labelItems" :key="key">
      <v-card class="mx-auto pa-4" variant="flat">
        <v-card-title>
          {{ key }}
        </v-card-title>
        <v-card-text>
          <template v-if="settings && settings.labels">
            <v-btn-toggle justify="center" color="primary">
              <v-btn :value="filter" @click="click(key, 'filter')" icon="mdi-image-off-outline"></v-btn>
              <v-btn :value="warn" @click="click(key, 'warn')" icon="mdi-alert-octagon"></v-btn>
              <v-btn :value="show" @click="click(key, 'show')" icon="mdi-image-outline"></v-btn>
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
      write: (v) => v instanceof Map ? JSON.stringify([...{ labels: JSON.stringify([...v.labels]), color: v.color }]) : JSON.stringify(v)
    }
  }
)
const settings = ref(null)
const labelItems = ref(new Map([['csam', 'filter'],
['dmca-violation', 'filter'],
['nudity-nonconsensual', 'filter'],
['!filter', 'filter'],
['!warn', 'filter'],
['account-security', 'filter'],
['porn', 'filter'],
['nsfl', 'filter'],
['nudity', 'filter'],
['sexual', 'filter'],
['gore', 'filter'],
['self-harm', 'filter'],
['torture', 'filter'],
['nsfl', 'filter'],
['icon-kkk', 'filter'],
['icon-nazi', 'filter'],
['icon-intolerant', 'filter'],
['behavior-intolerant', 'filter'],
['spam', 'filter'],
['impersonation', 'filter'],]))

const click = async (key, value) => {
  settings.value.labels.set(key, value)
}

onBeforeMount(async () => {
  console.log(userSettings.value)
  if (userSettings.value.has(route.params.did)) {
    settings.value = userSettings.value.get(route.params.did)
    if (!(settings.value.labels instanceof Map)) {
      settings.value.labels = labelItems
    }
  } else {
    settings.value = { labels: labelItems, color: null }
  }
});

watch(() => settings, () => {
  userSettings.value.set(route.params.did, settings.value)
  storageUserSettings.value = userSettings.value
}, { deep: true }
);
</script>