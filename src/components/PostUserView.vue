<template>
  <v-card-item class="w-100">
    {{ defProps.author }}
    <template v-slot:prepend>
      <div v-if="defProps.author" style="padding-right: 10px">

        <router-link :to="`/profile/${defProps.author.handle}`">
          <v-avatar color="surface-variant">
            <v-img cover v-bind:src=defProps.author.avatar alt="avatar"></v-img>
          </v-avatar>
        </router-link>
      </div>
    </template>
    <v-list-item-subtitle>{{ defProps.author.displayName }}</v-list-item-subtitle>
    <v-list-item-subtitle>@{{ defProps.author.handle }}</v-list-item-subtitle>
    <template v-if="defProps.createdAt">
      <v-list-item-subtitle>{{ convertDate(defProps.createdAt) }}</v-list-item-subtitle>
    </template>
    <template v-if="defProps.indexedAt">
      <v-list-item-subtitle>{{ convertDate(defProps.indexedAt) }}</v-list-item-subtitle>
    </template>
  </v-card-item>
</template>

<script setup>
import { defineProps } from 'vue'
import { useDate } from "@/common/date";

const defProps = defineProps({
  author: null,
  createdAt: null,
  indexedAt: null
})
const { convertDate } = useDate()


</script>
