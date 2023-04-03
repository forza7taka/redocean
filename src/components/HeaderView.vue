<template>
<div>
  <v-app-bar fixed color="pink-lighten-2 lighten-5">
    <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
    <v-toolbar-title>RedOcean</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="this.$store.getters.getAccessJwt" @click="dialog = true"><v-icon>mdi-plus</v-icon></v-btn>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-list nav dense>
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.name"
          :prepend-icon="menuItem.icon"
          :to="menuItem.link"
          active-class="deep-purple--text text--accent-4">
          <router-link :to= menuItem.link>   
            {{menuItem.name}}
          </router-link>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>

  <div v-if="dialog == true">
      <PostView v-model="dialog" @onClose="onClose" mode="Post"></PostView>    
  </div>
</template>

<script>
  import PostView from "./PostView.vue"
  export default {
    name: "App",
    components: {       
      PostView
    },
    data() {
      return {
        drawer: false,
        dialog: false,
        // file: null,
        // image: null,
        // contents: '',
        // cid: '',
        menuItems: [
        {
          icon: "mdi-account-plus",
          name: "Account",
          link: "/accountCreate",
        },
        {
          icon: "mdi-home",
          name: "Home",
          link: "/",
        },
        {
         icon: "mdi-view-list",
          name: "Timeline",
          link: "/timeline",
        },
        {
          icon: "mdi-face-profile",
          name: "Profile",
          link: "/profile"
        },
        {
          icon: "mdi-fire",
          name: "Popular",
          link: "/popular"
        },
        {
          icon: "mdi-shield-account",
          name: "PrivacyPolicy",
          link: "/privacypolicy"
        },
        // {
        //   icon: "mdi-fire",
        //   name: "suggestions",
        //   link: "/suggestions"
        // },
        ]
      }
    },
    methods: {
      onClose(value) {
         this.dialog = value;
      },
    }
  }
  </script>