<template>
  <div class="displayArea mx-auto">
    <div v-if="profile">
      <v-card class="mx-auto mt-5">
        <v-card-actions>
          <v-list-item class="w-100">
            <template v-slot:prepend>
              <v-avatar size="150" rounded="0">
                <v-img v-bind:src=profile.avatar alt="avatar" cover class="rounded-xl"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title>
              {{ profile.displayName }}
              <v-btn size=15 v-if="profile && profile.did == store.getters.getDid" icon to="/profileEdit">
                <v-icon size="15">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>
              @{{ profile.handle }}
              <v-btn size=12 v-if="profile && profile.did == store.getters.getDid" icon to="handleEdit">
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
            <v-list-item-subtitle v-if="profile && profile.did == store.getters.getDid">
              <router-link v-if="mutes" :to="`/mutes`" style="text-decoration: none; color: inherit;">
                Mutes: {{ mutes.length }}
              </router-link>
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="profile && profile.did == store.getters.getDid">
              <router-link v-if="blocks" :to="`/blocks`" style="text-decoration: none; color: inherit;">
                Blocks: {{ blocks.length }}
              </router-link>
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="inviteCodes && inviteCodes.length !== 0">
              <router-link v-if="mutes" :to="`/inviteCodes`" style="text-decoration: none; color: inherit;">
                InviteCode: {{ inviteCodes.length }}
              </router-link>
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <v-btn v-if="profile && store.getters.getFollows && store.getters.getFollows.includes(profile.did)"
                @click.prevent="doUnFollow()" icon><v-icon>mdi-account-remove</v-icon></v-btn>
              <v-btn v-if="profile && store.getters.getFollows && !store.getters.getFollows.includes(profile.did)"
                @click.prevent="doFollow()" icon><v-icon>mdi-account-check</v-icon></v-btn>

              <v-btn v-if="profile && profile.did != store.getters.getDid && profile.viewer && profile.viewer.muted"
                @click.prevent="unMute(profile.did); profile.viewer.muted = !profile.viewer.muted"
                icon><v-icon>mdi-volume-high</v-icon></v-btn>
              <v-btn v-if=" profile && profile.did != store.getters.getDid && !(profile.viewer && profile.viewer.muted) "
                @click.prevent=" mute(profile.did); profile.viewer.muted = !profile.viewer.muted "
                icon><v-icon>mdi-volume-mute</v-icon></v-btn>
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <v-btn v-if=" profile && store.getters.getBlocks && store.getters.getBlocks.includes(profile.did) "
                @click.prevent=" doUnBlock() " icon><svg-icon type="mdi" :path= mdiAccountLockOpen ></svg-icon></v-btn>
              <v-btn v-if=" profile && store.getters.getBlocks && !store.getters.getBlocks.includes(profile.did) "
                @click.prevent=" doBlock() " icon><v-icon>mdi-account-cancel</v-icon></v-btn>

              <v-btn v-if=" profile " :to=" `/reportUser/${encodeURIComponent(profile.handle)}` " icon>
                <v-icon>mdi-alert-circle-outline</v-icon>
              </v-btn>

            </v-list-item-subtitle>
          </v-list-item>
        </v-card-actions>
      <v-card-text class="text-pre-wrap">
          <div v-if=" profile && profile.description ">
            {{ profile.description }}
          </div>
        </v-card-text>
        <v-card-text>
          <div justify="center"></div>
        </v-card-text>
      </v-card>
    </div>
    <div v-if=" profile && profile.viewer && (profile.viewer.blocking || profile.viewer.blockedBy) ">
      <v-container class="my-5">
        <v-row justify="center">
          Blocked User
        </v-row>
      </v-container>
    </div>
    <div v-else ref="root">
      <FeedView :feeds=" timeline.array "></FeedView>
      <div ref="loading">
        <v-container class="my-5">
          <v-row justify="center">
            <v-progress-circular model-value="20"></v-progress-circular>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccountLockOpen } from '@mdi/js'
import FeedView from './FeedView.vue'
import { useFollow } from "../common/follow"
import { useMute } from "../common/mute"
import { useBlock } from "../common/block"
import { ref, watch, onBeforeMount, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useIntersectionObserver } from '@vueuse/core'
import { useRequestGet } from '../common/requestGet.js'
import { useHistoryState, onBackupState } from 'vue-history-state'
import { useRoute } from "vue-router"
import { createToaster } from '@meforma/vue-toaster'
import Timeline from '@/common/timeline.js'

const route = useRoute()
const store = useStore()

const { follow, unFollow } = useFollow(store)
const { mute, unMute } = useMute(store)
const { block, unBlock } = useBlock(store)

const completedAuthorFeed = ref(false)
const completedLikes = ref(false)
const completedMutes = ref(false)
const completedBlocks = ref(false)

const cursor = ref(null)
const likesCursor = ref(null)
const mutesCursor = ref(null)
const blocksCursor = ref(null)
const historyState = useHistoryState();
const handle = ref(null)
const timeline = ref(new Timeline())
const profile = ref(null)
const mutes = ref([])
const blocks = ref([])
const likes = ref([])
const inviteCodes = ref([])

const root = ref(null)
const loading = ref(null)
const requestGet = useRequestGet(store)
const toast = createToaster()
const loadingCount = ref(0)

useIntersectionObserver(
  loading,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !completedAuthorFeed.value && loadingCount.value != 0) {
      await getAuthorFeed(handle, cursor)
    }
    loadingCount.value = loadingCount.value + 1
  },
)

onBeforeMount(async () => {
  if (historyState.action === 'reload') {
    handle.value = await getHandle()
    profile.value = historyState.data.profile
    likes.value = Object.values(historyState.data.likes)
    mutes.value = Object.values(historyState.data.mutes)
    blocks.value = Object.values(historyState.data.blocks)
    inviteCodes.value = Object.values(historyState.data.inviteCodes)
    timeline.value = new Timeline()
    await getAuthorFeed(handle, cursor)
    return
  }
  if (historyState.action === 'back' || historyState.action === 'forward') {
    handle.value = historyState.data.handle
    profile.value = historyState.data.profile
    likes.value = Object.values(historyState.data.likes)
    mutes.value = Object.values(historyState.data.mutes)
    blocks.value = Object.values(historyState.data.blocks)
    inviteCodes.value = Object.values(historyState.data.inviteCodes)
    timeline.value.setArray(Object.values(historyState.data.timeline))
    return
  }
  await load()
})

onBackupState(() => ({
  handle: handle,
  profile: profile,
  timeline: timeline.value.array,
  mutes: mutes,
  blocks: blocks,
  likes: likes,
  inviteCodes: inviteCodes,
}));

const load = async () => {
  handle.value = await getHandle()
  await getProfile(handle)

  completedAuthorFeed.value = false
  await getAuthorFeed(handle, cursor)

  if (handle.value == store.getters.getHandle) {
    await getInviteCodes()
  }

  completedMutes.value = false
  while (!completedMutes.value) {
    await getMutes(mutesCursor)
  }
  completedBlocks.value = false
  while (!completedBlocks.value) {
    await getBlocks(blocksCursor)
  }

  completedLikes.value = false
  while (!completedLikes.value) {
    await getLikes(handle, likesCursor)
  }
};

const getAuthorFeed = async (handle, cur) => {
  if (profile.value.viewer.blocking || profile.value.viewer.blockedBy) {
    return
  }

  let params = {}
  if (!cur) {
    params = { actor: handle.value }
  } else {
    params = { actor: handle.value, cursor: cur.value }
  }
  try {
    const response = await requestGet.get("app.bsky.feed.getAuthorFeed", params)
    timeline.value.setArray(response.res.feed)
    cursor.value = response.res.cursor
    if (response.res.feed.length == 0) {
      completedAuthorFeed.value = true
    }
  } catch (e) {
    toast.error(e.toString(), { position: "top-right" })
  }
}

const getProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle.value })
    profile.value = response.res
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const stopWatch = watch(
  () => route.currentRoute,
  async () => {
    handle.value = await getHandle()
    await getProfile(handle.value)
    await getAuthorFeed(handle.value, null)
  }
)

onUnmounted(stopWatch)

const getMutes = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getMutes", params)
    mutesCursor.value = response.res.cursor
    if (response.res.mutes.length == 0) {
      completedMutes.value = true
    }
    mutes.value = mutes.value.concat(response.res.mutes)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getBlocks = async (cursor) => {
  let params = {}
  if (!cursor) {
    params = {}
  } else {
    params = { cursor: cursor.value }
  }
  try {
    const response = await requestGet.get("app.bsky.graph.getBlocks", params)
    blocksCursor.value = response.res.cursor
    if (response.res.blocks.length == 0) {
      completedBlocks.value = true
    }
    blocks.value = blocks.value.concat(response.res.blocks)
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
        cursor: cursor.value,
        limit: 100
      }
    }
    const response = await requestGet.get("com.atproto.repo.listRecords", params)
    likes.value = likes.value.concat(response.res.records)
    likesCursor.value = response.res.cursor
    if (response.res.records.length == 0) {
      completedLikes.value = true
      return
    }
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const getInviteCodes = async () => {
  try {
    const response = await requestGet.get("com.atproto.server.getAccountInviteCodes", {})
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

const doBlock = async () => {
  await block(profile.value.did)
  await getProfile(handle)
}

const doUnBlock = async () => {
  await unBlock(store.getters.getDid, profile.value.did)
  await getProfile(handle)
}

const getHandle = async () => {
  if (route.params.handle) {
    return route.params.handle
  }
  return store.getters.getHandle
}
</script>