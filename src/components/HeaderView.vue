<template>
<div>
  <v-app-bar fixed color="pink-lighten-2 lighten-5">
    <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
    <v-toolbar-title>RedOcean</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="this.$store.getters.getAccessJwt" @click="searchDialog = true"><v-icon>mdi-magnify</v-icon></v-btn>
    
    <div v-if="unReadCount != 0">
      <v-badge right top overlap color="blue">
        <template #badge>
          <span>{{ unReadCount }}</span>
        </template>
        <v-btn to="/notification" icon>
          <v-icon size="18" color="white">mdi-bell</v-icon>
        </v-btn>
      </v-badge>
    </div>
    <div v-if="unReadCount == 0">
      <v-btn to="/notification" icon>
      <v-icon size="18">mdi-bell</v-icon>
    </v-btn>    
  </div>


    <v-btn v-if="this.$store.getters.getAccessJwt" @click="postDialog = true"><v-icon>mdi-plus</v-icon></v-btn>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-list nav dense>
        <v-list-item
          v-for="menuItem in menuItems"
          :key="menuItem.name"
          :prepend-icon="menuItem.icon"
          
          active-class="deep-purple--text text--accent-4">
          <router-link :to= menuItem.link>   
            {{menuItem.name}}
          </router-link>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>

  <div v-if="postDialog == true">
      <PostView v-model="postDialog" @onPostDialogClose="onPostDialogClose" mode="Post"></PostView>    
  </div>
  <div v-if="searchDialog == true">
      <SearchView
       v-model="searchDialog" @onSearchDialogClose="onSearchDialogClose" mode="Post"></SearchView>    
  </div>
</template>

<script>
  import PostView from "./PostView.vue"
  import SearchView from "./SearchView.vue"
  export default {
    name: "App",
    components: {       
      PostView,
      SearchView
    },
    data() {
      return {
        drawer: false,
        postDialog: false,
        searchDialog: false,
        unReadCount: 0,
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
          icon: "mdi-star",
          name: "Suggestions",
          link: "/suggestions"
        },
        {
          icon: "mdi-shield-account",
          name: "PrivacyPolicy",
          link: "/privacypolicy"
        },
        ]
      }
    },
    mounted() {
      setInterval(() => {
        this.getUnreadCount()
        }, 60000);
    },
    methods: {
      async getUnreadCount() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.notification.getUnreadCount')
        console.log(response.data)
        this.unReadCount =  response.data.count
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
      },
      onPostDialogClose(value) {
         this.postDialog = value;
      },
      onSearchDialogClose(value) {
        this.searchDialog = value;
    },
    }
  }
  </script>

  <style scoped></style>