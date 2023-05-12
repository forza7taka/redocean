<template>
        <div v-if="defProps.images">
          <v-card-text>
            <v-list-item v-for="(i, iIndex) in defProps.images" :key="iIndex">
                  <v-img v-bind:src=i.fullsize v-bind:lazy-src=i.thumb class="rounded-xl" alt=""></v-img>
              </v-list-item>
          </v-card-text>
        </div>
</template>

<script setup>
import { defineProps } from 'vue'

const defProps = defineProps({
  images: null,
})
</script>
