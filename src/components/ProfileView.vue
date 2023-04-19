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
            <v-btn size=12 v-if="profile.did == store.getters.getDid" icon to="handleEdit">
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
          <v-list-item-subtitle v-if="profile.did == store.getters.getDid">
            <router-link v-if="mutes" :to="`/mutes`" style="text-decoration: none; color: inherit;">
              Mutes: {{ mutes.length }}
            </router-link>
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-btn v-if="store.getters.follows.includes(profile.did)" @click.prevent="doUnFollow()"
              icon><v-icon>mdi-account-remove</v-icon></v-btn>
            <v-btn v-if="!store.getters.follows.includes(profile.did)" @click.prevent="doFollow()"
              icon><v-icon>mdi-account-check</v-icon></v-btn>

            <v-btn v-if="profile.did != store.getters.getDid && profile.viewer && profile.viewer.muted"
              @click.prevent="unMute(profile.did); profile.viewer.muted = !profile.viewer.muted"
              icon><v-icon>mdi-volume-high</v-icon></v-btn>
            <v-btn v-if="profile.did != store.getters.getDid && !(profile.viewer && profile.viewer.muted)"
              @click.prevent="mute(profile.did); profile.viewer.muted = !profile.viewer.muted"
              icon><v-icon>mdi-volume-mute</v-icon></v-btn>

          </v-list-item-subtitle>
          <v-btn size=15 v-if="profile.did == store.getters.getDid" icon to="/profileEdit">
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
    <div ref="load">
      <v-container class="my-5">
        <v-row justify="center">
          <v-progress-circular model-value="20"></v-progress-circular>
        </v-row>
      </v-container>
    </div>
</template>

<script setup>
import FeedView from './FeedView.vue'
import { useFollow } from "../common/follow"
import { useUnFollow } from "../common/unFollow"
import { useMute } from "../common/mute"
import { useUnMute } from "../common/unMute"
import { ref, watch, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { useHistoryState, onBackupState } from 'vue-history-state';
import { useRoute } from "vue-router";
import { createToaster } from '@meforma/vue-toaster';
import { useIntersectionObserver } from '@vueuse/core'


const { follow } = useFollow()
const { unFollow } = useUnFollow()
const { mute } = useMute()
const { unMute } = useUnMute()

const route = useRoute()
const store = useStore()

const complated = ref(false)
const fetchedTimeline = ref({ feed: [] })
const cursor = ref(null)
const historyState = useHistoryState();
const timeline = ref(historyState.data || fetchedTimeline)

const load = ref(null)
const requestGet = useRequestGet()
const toast = createToaster()
const handle = ref(null)
const likesCursor = ref(null)
const mutesCursor = ref(null)
const profile = ref(null)
const mutes = ref([])
const likes =ref([])
const inviteCodes = ref([])

onBeforeMount(async () => {
  handle.value = await getHandle()
  await getProfile(handle)
  await getAuthorFeed(handle, cursor)
  if (handle.value == store.getters.getHandle) {
    await getInviteCodes()
  }
  complated.value = false
  while (!complated.value) {
    await getLikes(handle, likesCursor)
  }
  complated.value = false
  while (!complated.value) {
    await getMutes(mutesCursor)
  }
  if (historyState.action === 'reload') {
    timeline.value = fetchedTimeline.value
  }
})

onBackupState(() => timeline);

useIntersectionObserver(
  load,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !complated.value) {
      handle.value = await getHandle()
      await getAuthorFeed(handle, cursor)
    }
  },
)

const getAuthorFeed = async (handle, cursor) => {
  let params = {}
  if (!cursor) {
    params = { actor: handle.value }
  } else {
    params = { actor: handle.value, cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.feed.getAuthorFeed",  params )
    fetchedTimeline.value.feed = fetchedTimeline.value.feed.concat(response.res.feed)
    cursor = response.res.cursor
    if (response.res.feed.length == 0) {
      complated.value = true
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile",  { actor: handle.value  })
    profile.value = response.res.profile
    console.log(profile.value)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

watch(route, async () => {
  handle.value = await getHandle()
  await getProfile(handle)
  await getAuthorFeed(handle, null)
})


const getMutes = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getMutes",  params )
    mutesCursor.value = response.res.cursor
    if (response.res.mutes.length == 0) {
      complated.value = true
    }
    mutes.value = mutes.value.concat(response.res.mutes)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getLikes = async (handle, cursor) => {
  try {
    let params = {}
    if (!cursor) {
      params = {
        repo: handle.value,
        collection: "app.bsky.feed.like",
        limit: 100
      }
    } else {
      params = {
        repo: handle.value,
        collection: "app.bsky.feed.like",
        cursor: cursor.value
      }
    }
    const response = await requestGet.get("com.atproto.repo.listRecords",  params )
    likes.value = likes.value.concat(response.res.records)
    likesCursor.value = response.res.cursor
    if (response.res.records.length == 0) {
      complated.value = true
      return
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getInviteCodes = async () => {
  try {
    const response = await requestGet.get("com.atproto.server.getAccountInviteCodes", {
      params: {
      }
    })
    inviteCodes.value = response.res.codes
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const doFollow = async () => {
  await follow(profile.value.did)
  await getProfile(handle)
}

const doUnFollow = async () => {
  await unFollow(store.getters.getDid, profile.value.did)
  await getProfile(handle)
}

const getHandle = async () => {
  if (route.params.handle) {
    return route.params.handle
  }
  return store.getters.getHandle
}


</script>