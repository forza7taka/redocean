<template>
  <div class="displayArea mx-auto">
    <template v-for="(l, index) in labels" :key="index">
    <v-card class="mx-auto pa-4">
          <v-card-subtitle>
            {{ l.name }}:{{ l.discription }}
          </v-card-subtitle>
          <v-btn-toggle v-model="value[index]" color="primary">
            <v-btn icon="mdi-image-off-outline"></v-btn>
            <v-btn icon="mdi-alert-octagon"></v-btn>
            <v-btn icon="mdi-image-outline"></v-btn>
          </v-btn-toggle>
        </v-card>
     </template>
  </div>
</template>

<script setup>
import { ref, watchEffect, onBeforeMount } from 'vue'
import { useStorage } from '@vueuse/core'

const logins = ref(null)
const storageLogins = useStorage('storageLogins', logins)

const labels = ref([{ name: 'porn', value: "porn", discription: "sexual activity/animal genitalia and human" },
  { name: 'nudity', value: "nudity", discription: "male nudity/female nudity" },
  { name: 'sexual', value: "sexual", discription: "general suggestive" },
  { name: 'gore', value: "gore", discription: "very bloody" },
  { name: 'corpse', value: "corpse", discription: "human corpse" },
{ name: 'self-harm', value: "self-harm", discription: "self_harm" },
{ name: 'icon-nazi', value: "icon-nazi", discription: "nazi" },
{ name: 'icon-kkk', value: "icon-kkk", discription: "kkk" },
{ name: 'icon-confederate', value: "icon-confederate", discription: "confederate" }
])

const value = ref([])

onBeforeMount(async () => {
  logins.value[0].labels = Object.values(logins.value[0].labels)
  if (logins.value[0].labels) {
    value.value = Object.values(logins.value[0].labels)
  } else {
    value.value = new Array()
    logins.value[0].labels = []
  }

});

watchEffect(() => {
  logins.value[0].labels = value.value
  storageLogins.value = logins.value;
});

</script>