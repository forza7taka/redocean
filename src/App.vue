<template>
  <v-app color="red-lighten-4">
    <Header/>
    <v-main>
      <router-view/>
      <!-- <v-btn v-if="this.$store.getters.getAccessJwt" @click="dialog = true" fixed bottom right fab><v-icon>mdi-plus</v-icon></v-btn>

      <div v-if="dialog == true">
        <PostView v-model="dialog" @onClose="onClose" mode="post"></PostView>    
      </div> -->
    </v-main>
  </v-app>
</template>

<script>
import Header from '@/components/HeaderView.vue'
//import PostView from "@/components/PostView.vue"

export default {
  name: 'App',
  components: {
    Header,
   // PostView
  },
  data: () => ({
    dialog: false,
  }),
  methods: {
    onClose(value) {
      this.dialog = value;
    },
  },
  mounted() {
    // 最初のページビューのみトラッキング
    if (this.$route.path === '/') {
     this.$gtag.pageview(window.location.pathname);
    }
  }
}
</script>
