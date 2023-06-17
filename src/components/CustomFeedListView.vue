<template>
  <div class="displayArea mx-auto">
    <template v-if="feeds">
      <div v-for="(f, fIndex) in feeds" :key="fIndex">
        <v-card variant="flat">
          <v-card-actions>
            <v-list-item class="w-80">
              <template v-slot:prepend>
                <template v-if="!subscribedFeeds.includes(f.uri)">
                  <v-btn icon @click="subscribe(f.uri)">
                    <v-icon>mdi-playlist-check</v-icon>
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn icon @click="unSubscribe(f.uri)" color="blue">
                    <v-icon>mdi-playlist-check</v-icon>
                  </v-btn>
                </template>
                <v-avatar size="100" rounded="0">
                  <v-img v-bind:src="f.avatar" alt="avatar" cover class="rounded-xl"></v-img>
                </v-avatar>
              </template>
              <v-list-item-content>
                <v-list-item-title>
                  {{ f.displayName }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ f.description }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{ f.uri }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  Likes:{{ f.likeCount }}
                </v-list-item-subtitle>
                <v-card class="mx-auto mt-5" variant="flat">
                  <v-card-actions>
                    <v-list-item class="w-80">
                      <template v-slot:prepend>
                        <div style="padding-right: 10px">
                          <router-link :to="`/profile/${f.creator.handle}`">
                            <v-avatar color="surface-variant">
                              <v-img cover v-bind:src="f.creator.avatar" alt="avatar"></v-img>
                            </v-avatar>
                          </router-link>
                        </div>
                      </template>
                      <v-list-item-subtitle>
                        {{ f.creator.displayName }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle>
                        @{{ f.creator.handle }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-card-actions>
                </v-card>
              </v-list-item-content>
            </v-list-item>
          </v-card-actions>
          <v-divider></v-divider>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useCatchError } from '@/common/catchError';
import { useRequestGet } from "@/common/requestGet";
import { useStorage } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useSettings } from '@/common/settings'
import { useParseSettings } from "@/common/parseSettings"
import { Setting } from "@/common/setting"

const parseSettings = useParseSettings()

const route = useRoute()

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

const store = useStore()
const requestGet = useRequestGet(store)
const feedUris = ref(["at://did:plc:au6x2h2niz27male2krpwmzz/app.bsky.feed.generator/includesWord"])
const feeds = ref(new Array())

const subscribedFeeds = ref(new Array())

onBeforeMount(async () => {
  userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
  if (userSettings.value.feeds) {
    subscribedFeeds.value = userSettings.value.feeds
  }
  await getPopularFeedGenerators()
});

onUnmounted(async () => {
  parseSettings.upload()
})

const subscribe = async (uri) => {
  if (!subscribedFeeds.value.includes(uri)) {
    subscribedFeeds.value.push(uri)
  }
}

const unSubscribe = async (uri) => {
  for (let i = 0; i < subscribedFeeds.value.length; i++) {
    const feedUri = subscribedFeeds.value[i]
    if (uri == feedUri) {
      subscribedFeeds.value.splice(i, 1)
    }
  }
}

const getPopularFeedGenerators = async () => {
  try {
    const response1 = await requestGet.get("app.bsky.feed.describeFeedGenerator")
    for (let i = 0; i < response1.res.feeds.length; i++) {
      const feed = response1.res.feeds[i]
      feedUris.value.push(feed.uri)
    }

    const response2 = await requestGet.get("app.bsky.unspecced.getPopularFeedGenerators")
    for (let i = 0; i < response2.res.feeds.length; i++) {
      const feed = response2.res.feeds[i]
      feedUris.value.push(feed.uri)
    }

    const params = { feeds: feedUris.value }
    const response3 = await requestGet.get("app.bsky.feed.getFeedGenerators", params)

    feeds.value = response3.res.feeds

    console.log(feeds.value)
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

watch(() => subscribedFeeds, () => {
  for (let i = 0; i < settings.value.users.length; i++) {
    const user = settings.value.users[i]
    if (route.params.did == user.did) {
      storageSettings.value.users[i].feeds = subscribedFeeds.value
    }
  }
}, { deep: true }
);

</script>