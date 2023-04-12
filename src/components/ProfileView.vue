<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <v-card-actions>
        <v-list-item class="w-100">
          <template v-slot:prepend>
            <v-avatar color="grey" size="150" rounded="0">
              <v-img cover v-bind:src=profile.avatar alt="avatar"></v-img>
            </v-avatar>
          </template>
          <v-list-item-title>
            {{ profile.displayName }}
          </v-list-item-title>
          <v-list-item-subtitle>
            @{{ profile.handle }}
            <v-btn size=12 v-if="profile.did == this.$store.getters.getDid" icon to="handleEdit">
              <v-icon size="12">mdi-pencil</v-icon>
            </v-btn>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <router-link :to="`/followers/${encodeURIComponent(profile.handle)}`"
              style="text-decoration: none; color: inherit;">
              Followers:{{ profile.followersCount }}
            </router-link>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <router-link :to="`/follows/${encodeURIComponent(profile.handle)}`"
              style="text-decoration: none; color: inherit;">
              Follows:{{ profile.followsCount }}
            </router-link>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Posts: {{ profile.postsCount }}
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <router-link v-if="likes" :to="`/likes/${encodeURIComponent(profile.handle)}`"
              style="text-decoration: none; color: inherit;">
              Likes: {{ likes.length }}
            </router-link>
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="profile.did == this.$store.getters.getDid">
            <router-link v-if="mutes" :to="`/mutes`" style="text-decoration: none; color: inherit;">
              Mutes: {{ mutes.length }}
            </router-link>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-btn v-if="follows.includes(profile.did)" @click.prevent="doUnFollow()"
              icon><v-icon>mdi-account-remove</v-icon></v-btn>
            <v-btn v-if="!follows.includes(profile.did)" @click.prevent="doFollow()"
              icon><v-icon>mdi-account-check</v-icon></v-btn>

            <v-btn v-if="profile.did != this.$store.getters.getDid && profile.viewer && profile.viewer.muted"
              @click.prevent="unMute(profile.did); profile.viewer.muted = !profile.viewer.muted"
              icon><v-icon>mdi-volume-high</v-icon></v-btn>
            <v-btn v-if="profile.did != this.$store.getters.getDid && !(profile.viewer && profile.viewer.muted)"
              @click.prevent="mute(profile.did); profile.viewer.muted = !profile.viewer.muted"
              icon><v-icon>mdi-volume-mute</v-icon></v-btn>

          </v-list-item-subtitle>
          <v-btn size=15 v-if="profile.did == this.$store.getters.getDid" icon to="/profileEdit">
            <v-icon size="15">mdi-pencil</v-icon>
          </v-btn>
        </v-list-item>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <div v-if="profile && profile.description" v-html="this.replaceUrls(profile.description)">
        </div>
      </v-card-text>
      <v-card-subtitle v-if="inviteCodes">
        <v-list-item-subtitle>
          InviteCode:
        </v-list-item-subtitle>
        <div v-for="(c, cIndex) in inviteCodes" :key="cIndex">

          <v-list-item-subtitle v-if="!c.disable">
            <div v-if="c.available - c.uses.length != 0">
              {{ c.code }} last:{{ c.available - c.uses.length }}
            </div>
          </v-list-item-subtitle>
        </div>
      </v-card-subtitle>
    </v-card>
  </div>
  <FeedView :timeline="timeline"></FeedView>
  <infinite-loading @infinite="infiniteHandler" :firstload=false>
    <template #spinner>
      <span>loading...</span>
    </template>
    <template #complete>
      <span>No more data found!</span>
    </template>
  </infinite-loading>
</template>

<script>
import { useFollow } from "../common/follow"
import { useUnFollow } from "../common/unFollow"
import { useMute } from "../common/mute"
import { useUnMute } from "../common/unMute"
import { provide } from 'vue'
import { useStore } from 'vuex'
import FeedView from './FeedView.vue'
import InfiniteLoading from 'v3-infinite-loading'

export default {
  components: {
    FeedView,
    InfiniteLoading
  },
  setup() {
    provide('store', useStore())
    const { follow } = useFollow()
    const { unFollow } = useUnFollow()
    const { mute } = useMute()
    const { unMute } = useUnMute()
    return { follow, unFollow, mute, unMute }
  },
  data() {
    return {
      profile: [],
      handle: "",
      did: "",
      timeline: { feed: [] },
      complated: false,
      cursor: null,
      likesCursor: null,
      mutesCursor: null,
      inviteCodes: null,
      mutesCount: null,
      likes: [],
      mutes: []
    };
  },
  computed: {
    follows() {
      return this.$store.state.follows
    }
  },
  watch: {
    '$route.params.handle': {
      async handler() {
        this.timeline = { feed: [] }
        this.handle = await this.getHandle()
        await this.getProfile(this.handle)
        await this.getAuthorFeed(this.handle, null)
      }
    }
  },
  async beforeMount() {
    this.handle = await this.getHandle()
    await this.getProfile(this.handle)
    await this.getAuthorFeed(this.handle, this.cursor)
    if (this.handle == this.$store.getters.getHandle) {
      await this.getInviteCodes()
    }
    this.complated = false
    while (!this.complated) {
      await this.getLikes(this.handle, this.likesCursor)
    }
    this.complated = false
    while (!this.complated) {
      await this.getMutes(this.mutesCursor)
    }
  },
  mounted() {
  },
  methods: {
    async getMutes(cursor) {
      let params = {}
      if (!cursor) {
        params = {}
      } else {
        params = { cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get("https://bsky.social/xrpc/app.bsky.graph.getMutes", { params })
        console.log(response.data)
        this.mutesCursor = response.data.cursor
        if (response.data.mutes.length == 0) {
          this.complated = true
        }
        this.mutes = this.mutes.concat(response.data.mutes)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getLikes(handle, cursor) {
      try {
        let params = {}
        if (!cursor) {
          params = {
            repo: handle,
            collection: "app.bsky.feed.like",
            limit: 50
          }
        } else {
          params = {
            repo: handle,
            collection: "app.bsky.feed.like",
            cursor: cursor
          }
        }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.repo.listRecords', {
          params
        })
        this.likes = this.likes.concat(response.data.records)
        this.likesCursor = response.data.cursor
        console.log(response.data.records.length)
        if (response.data.records.length == 0) {
          this.complated = true
          return
        }
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getInviteCodes() {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/com.atproto.server.getAccountInviteCodes', {
          params: {
          }
        })
        console.log(response.data.codes)
        this.inviteCodes = response.data.codes
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async doFollow() {
      await this.follow(this.profile.did)
      await this.getProfile(this.handle)
    },
    async doUnFollow() {
      await this.unFollow(this.$store.getters.getDid, this.profile.did)
      await this.getProfile(this.handle)
    },
    async infiniteHandler($state) {
      if (this.complated) {
        $state.complete()
      } else {
        $state.loaded()
        this.getAuthorFeed(this.handle, this.cursor)
      }
    },
    async getHandle() {
      if (this.$route.params.handle) {
        return this.$route.params.handle
      }
      return this.$store.getters.getHandle
    },
    async getProfile(handle) {
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
          params: {
            actor: handle
          }
        })
        this.profile = response.data
        console.log(this.profile)
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    async getAuthorFeed(handle, cursor) {
      let params = {}
      if (!cursor) {
        params = { actor: handle }
      } else {
        params = { actor: handle, cursor: cursor }
      }
      try {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ` + this.$store.getters.getAccessJwt
        let response = await this.axios.get('https://bsky.social/xrpc/app.bsky.feed.getAuthorFeed', { params })
        console.log(response)
        this.timeline.feed = this.timeline.feed.concat(response.data.feed)

        this.cursor = response.data.cursor
        if (response.data.feed.length == 0) {
          this.complated = true
        }
      } catch (e) {
        this.$toast.show(e.response.data.error + " " + e.response.data.message, {
          type: "error",
          position: "top-right",
          duration: 8000
        })
      }
    },
    replaceUrls(text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const replacedText = text.replace(urlRegex, '<a href="$&" target="_blank">$&</a>');
      return replacedText;
    }
  }
}
</script>