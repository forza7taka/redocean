<template>
    <div v-scroll="onScroll">
      <v-card width="400px" class="mx-auto mt-5">
        <v-card-actions>
            <v-list-item class="w-100">
              <template v-slot:prepend>
                <v-avatar
                color="grey"
                size="150"
                rounded="0">
                  <v-img cover v-bind:src=profile.avatar alt="avatar"></v-img>
                </v-avatar>
              </template>
              <v-list-item-title>{{profile.displayName}}</v-list-item-title>
              <v-list-item-subtitle>@{{profile.handle}}</v-list-item-subtitle>
              <v-list-item-subtitle>
                <router-link :to="`/followers/${encodeURIComponent(profile.handle)}`" style="text-decoration: none; color: inherit;">
                  Followers:{{profile.followersCount}}
                </router-link>
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                <router-link :to="`/follows/${encodeURIComponent(profile.handle)}`" style="text-decoration: none; color: inherit;">
                  Follows:{{profile.followsCount}}
                </router-link>
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                  Posts: {{profile.postsCount }}
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                <v-btn v-if="follows.includes(profile.did)" @click.prevent="doUnFollow()">UnFollow</v-btn>
                <v-btn v-if="!follows.includes(profile.did)" @click.prevent="doFollow()">Follow</v-btn>
              </v-list-item-subtitle>
              <!-- <v-list-item-subtitle>
                <v-btn v-if="profile.viewer && profile.viewer.muted" @click.prevent="unMute(profile.did)">UnMute</v-btn>
                <v-btn v-if="!(profile.viewer && profile.viewer.muted)" @click.prevent="mute(profile.did)">Mute</v-btn>
              </v-list-item-subtitle>-->
            </v-list-item>
          </v-card-actions>
        <v-card-text class="text-pre-wrap">
          <div v-if="profile && profile.description" v-html="this.replaceUrls(profile.description)"></div>
        </v-card-text>
      </v-card>
    </div>
    <div v-if="complated == true">
    <FeedView :timeline="timeline"></FeedView>
    </div>
</template>

<script>
import { useFollow } from "../common/follow"
import { useUnFollow } from "../common/unFollow"
import { useMute } from "../common/mute"
import { useUnMute } from "../common/unMute"
import { provide} from 'vue'
import { useStore } from 'vuex'
import FeedView from './FeedView.vue'
  export default {
    components: {
      FeedView
    },
    setup() {
      provide('store', useStore())
      const { follow } = useFollow()
      const { unFollow } = useUnFollow()
      const { mute } = useMute()
      const { unMute } = useUnMute()
      return { follow, unFollow, mute, unMute}
    },
    data() {
      return {
        profile: [],
        handle: '',
        did: "",
        timeline:{ feed:[]},
        complated: false,
        cursor: null,
        isComplete: false
      };
    },
    computed: {
      follows() {
        return this.$store.state.follows
      }
    },
    watch: {
      $route() {
        this.handle = this.getHandle()
        this.getProfile(this.handle)
        this.getAuthorFeed(this.handle, this.cursor)
      }
    },
    beforeMount() {
        this.handle = this.getHandle()
        this.getProfile(this.handle)
        this.getAuthorFeed(this.handle, this.cursor)
    },
    mounted() {
    },
    methods: {
      async doFollow() {
        await this.follow(this.profile.did, this.profile.declaration.cid)
        await this.getProfile(this.handle)
      },
      async doUnFollow() {
        await this.unFollow(this.$store.getters.getDid, this.profile.did)
        await this.getProfile(this.handle)
      },
      onScroll() {
        if (this.isComplete) {
          return;
        }
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollHeight - scrollTop <= clientHeight) {
          this.getAuthorFeed(this.handle, this.cursor)
        }
      },
      getHandle() {
        if (this.$route.params.handle) {
          return  this.$route.params.handle
        }
        return  this.$store.getters.getHandle  
      },
      async getProfile(handle) {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        await this.axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
            params: {
                actor: handle
            }
        })
        .then(response => {
           this.profile = response.data
           console.log(this.profile)
        })
        .catch(err => {
          console.error(err)
        })
      },
      getAuthorFeed(handle, cursor) {
        let params = {}
        if (!cursor) {
          params = {author: handle}
        } else {
          params = {author: handle, before: cursor}
        }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed', {params})
        .then(response => {
            console.log(response)
            this.timeline.feed = this.timeline.feed.concat(response.data.feed)
            this.complated = true
            this.cursor = response.data.cursor
            if (response.data.feed.length == 0) {
              this.isComplete = true
            }
        })
        .catch(err => {
          console.error(err)
        })
      },
      replaceUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
        return replacedText;
      }
    }
  }
</script>