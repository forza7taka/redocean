<template>
  <div v-if="thread">
    <PostView :post="thread.post" :root="thread.post" :replies="thread.replies" :depth=0>
    </PostView>
  </div>
</template>

<script >
import PostView from "./PostView.vue"
import { ref, watch, provide, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster';
import { useRequestGet } from '../common/requestGet.js'
import { useRoute } from "vue-router";
export default {
  components: {
    PostView,
  },
  async setup() {
    const route = useRoute()
    const thread = ref(null)
    const cursor = ref(null)

    provide('store', useStore())

    onBeforeMount(async () => {
      getThread(cursor)
    });

    const getThread = async () => {
      try {
        if (!route.params.uri) {
          return
        }
        const params = { uri: route.params.uri }
        const req = useRequestGet()
        const response = await req.get("app.bsky.feed.getPostThread", params)
        thread.value = response.res.thread
      } catch (e) {
        const toast = createToaster()
        toast.error(e, { position: "top-right" })
      }
    }
    watch(route, () => getThread());

    return {
      thread
    }
  },

  methods: {

    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    }
  }
};
</script>