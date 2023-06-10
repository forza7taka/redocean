<template>
  <v-list v-if="props.feeds">
    <div v-for="(f, fIndex) in props.feeds" :key="fIndex">
      <template
        v-if="(!f.reason || (isShowRepost && f.reason)) && (!(f.reply && f.reply.parent) || (isShowReply && f.reply.parent))">
        <v-list-item>
          <v-row>
            <v-col class="justify-center align-center">
              <PostView v-if="f.reply" :post="f.post" :reason="f.reason" :parent="f.reply.parent" :root="f.reply.root"
                :depth="0" @deletePost="deletePost"></PostView>
              <PostView v-if="!f.reply" :post="f.post" :reason="f.reason" :depth="0" @deletePost="deletePost"></PostView>
            </v-col>
          </v-row>
        </v-list-item>
      </template>
    </div>
  </v-list>
</template>

<script setup>
import PostView from "./PostView.vue"
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  feeds: null,
  isShowReply: null,
  isShowRepost: null
})

const emit = defineEmits(
  ['deletePost']
)

const deletePost = async (uri) => {
  emit('deletePost', uri)
}
</script>
