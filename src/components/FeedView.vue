<template>
  <v-list>
    <v-list-item v-for="(f, fIndex) in props.timeline.feed" :key="fIndex">
      <v-row>
        <v-col class="d-flex justify-center align-center">
          <PostView v-if="f.reply" :post="f.post" :reason="f.reason" :parent="f.reply.parent" :root="f.reply.root"
            :depth="0"></PostView>
          <PostView v-if="!f.reply" :post="f.post" :reason="f.reason" :depth="0"></PostView>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import PostView from "./PostView.vue"
import { defineProps } from 'vue'

const props = defineProps({
  timeline: { feed:[] },
})
</script>
