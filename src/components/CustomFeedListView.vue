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
                  <template v-if="!pinnedFeeds.includes(f.uri)">
                    <v-btn icon @click="pinned(f.uri)">
                      <v-icon>mdi-pin-outline</v-icon>
                    </v-btn>
                  </template>
                  <template v-else>
                    <v-btn icon @click="unPinned(f.uri)" color="blue">
                      <v-icon>mdi-pin-outline</v-icon>
                    </v-btn>
                  </template>
                <v-avatar size="75" rounded="0">
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
                  Likes:
                  <v-btn class=" ma-2" variant="text" size="32" icon="mdi-heart" color="red"
                    v-if="store.getters.hasLike(f.uri)" @click="like(f)"></v-btn>
                  <v-btn class="ma-2" variant="text" size="32" icon="mdi-heart-outline" color="red" v-else
                    @click="like(f)"></v-btn>
                  {{ f.likeCount }}
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
import { ref, onBeforeMount, watch } from 'vue'
import { useStore } from 'vuex'
import { useCatchError } from '@/common/catchError'
import { useRequestGet } from "@/common/requestGet"
import { useRequestPost } from "@/common/requestPost"

const store = useStore()
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)

const feedUris = ref([
  "at://did:plc:au6x2h2niz27male2krpwmzz/app.bsky.feed.generator/hashtagTrends",  
  "at://did:plc:au6x2h2niz27male2krpwmzz/app.bsky.feed.generator/includesWord",
  "at://did:plc:au6x2h2niz27male2krpwmzz/app.bsky.feed.generator/hashtagTrends",
  "at://did:plc:hiptcrt4k63szzz4ty3dhwcp/app.bsky.feed.generator/ko-images",
  "at://did:plc:hiptcrt4k63szzz4ty3dhwcp/app.bsky.feed.generator/ja-images",
  "at://did:plc:hiptcrt4k63szzz4ty3dhwcp/app.bsky.feed.generator/illusts"])

const feeds = ref(new Array())

const subscribedFeeds = ref(new Array())
const pinnedFeeds = ref(new Array())

onBeforeMount(async () => {
  const response = await requestGet.get("app.bsky.actor.getPreferences")
  for (let i = 0; i < response.res.preferences.length; i++) {
    const preference = response.res.preferences[i]
    if (preference.$type == "app.bsky.actor.defs#savedFeedsPref") {
      subscribedFeeds.value = preference.saved
      pinnedFeeds.value = preference.pinned
      break
    }
  }
  await getFeedGenerators()
});


const subscribe = async (uri) => {
  if (!subscribedFeeds.value.includes(uri)) {
    subscribedFeeds.value.push(uri)
  }
  update()
}

const unSubscribe = async (uri) => {
  for (let i = 0; i < subscribedFeeds.value.length; i++) {
    const feedUri = subscribedFeeds.value[i]
    if (uri == feedUri) {
      subscribedFeeds.value.splice(i, 1)
    }
  }
  update()
}

const pinned = async (uri) => {
  if (!pinnedFeeds.value.includes(uri)) {
    pinnedFeeds.value.push(uri)
  }
  update()
}

const unPinned = async (uri) => {
  for (let i = 0; i < pinnedFeeds.value.length; i++) {
    const feedUri = pinnedFeeds.value[i]
    if (uri == feedUri) {
      pinnedFeeds.value.splice(i, 1)
    }
  }
  update()
}


const update = async () => {
  const response = await requestGet.get("app.bsky.actor.getPreferences")
  for (let i = 0; i < response.res.preferences.length; i++) {
    if (response.res.preferences[i].$type == "app.bsky.actor.defs#savedFeedsPref") {
      response.res.preferences[i].saved = subscribedFeeds.value
      response.res.preferences[i].pinned = pinnedFeeds.value
      break
    }
  }
  await requestPost.post("app.bsky.actor.putPreferences", { preferences: response.res.preferences })
}

const like = async (feed) => {
  try {
    if (!store.getters.hasLike(feed.uri)) {
      const subject = { uri: feed.uri, cid: feed.cid }
      const response = await requestPost.post("com.atproto.repo.createRecord", {
        collection: "app.bsky.feed.like",
        repo: store.getters.getDid,
        record: {
          subject: subject,
          createdAt: new Date()
        }
      })
      feed.likeCount = feed.likeCount + 1
      store.dispatch('doAddLike', { key: feed.uri, value: response.res.uri });
    } else {
      await requestPost.post("com.atproto.repo.deleteRecord", {
        collection: "app.bsky.feed.like",
        repo: store.getters.getDid,
        rkey: store.getters.getLikes.get(feed.uri).substr(-13)
      })
      feed.likeCount = feed.likeCount - 1
      store.dispatch('doRemoveLike', feed.uri);
    }
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}


const getFeedGenerators = async () => {
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

watch(() => [subscribedFeeds, pinnedFeeds], async () => {
  update()
}, { deep: true }
);

</script>