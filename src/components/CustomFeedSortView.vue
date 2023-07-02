<template>
  <div class="displayArea mx-auto">
    <v-toolbar title="SubscribedFeeds"></v-toolbar>
    <template v-if="subscribedFeeds">
      <div v-for="(f, fIndex) in subscribedFeeds" :key="fIndex">
        <v-card variant="flat">
          <v-card-actions>
            <template v-if="fIndex == 0">
              <v-btn icon @click="up(fIndex)" disabled>
                <v-icon>mdi-chevron-double-up</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon @click="up(fIndex)">
                <v-icon>mdi-chevron-double-up</v-icon>
              </v-btn>
            </template>
            <template v-if="fIndex == subscribedFeeds.length - 1">
              <v-btn icon @click="down(fIndex)" disabled>
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon @click="down(fIndex)">
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </template>
            <v-list-item class="w-80">
              <template v-slot:prepend>
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
    <v-toolbar title="PinnedFeeds"></v-toolbar>
    <template v-if="pinnedFeeds">
      <div v-for="(f, fIndex) in pinnedFeeds" :key="fIndex">
        <v-card variant="flat">
          <v-card-actions>
            <template v-if="fIndex == 0">
              <v-btn icon @click="up(fIndex)" disabled>
                <v-icon>mdi-chevron-double-up</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon @click="up(fIndex)">
                <v-icon>mdi-chevron-double-up</v-icon>
              </v-btn>
            </template>
            <template v-if="fIndex == subscribedFeeds.length - 1">
              <v-btn icon @click="down(fIndex)" disabled>
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon @click="down(fIndex)">
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </template>
            <v-list-item class="w-80">
              <template v-slot:prepend>
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

const subscribedFeedUris = ref(new Array())
const pinnedFeedUris = ref(new Array())

const subscribedFeeds = ref(new Array())
const pinnedFeeds = ref(new Array())

const down = async (index) => {
  const feed1 = subscribedFeeds.value[index]
  const feedUri1 = subscribedFeedUris.value[index]
  const feed2 = subscribedFeeds.value[index + 1]
  const feedUri2 = subscribedFeedUris.value[index + 1]
  subscribedFeeds.value[index + 1] = feed1
  subscribedFeedUris.value[index + 1] = feedUri1
  subscribedFeeds.value[index] = feed2
  subscribedFeedUris.value[index] = feedUri2
}
const up = async (index) => {
  const feed1 = subscribedFeeds.value[index]
  const feedUri1 = subscribedFeedUris.value[index]
  const feed2 = subscribedFeeds.value[index - 1]
  const feedUri2 = subscribedFeedUris.value[index - 1]
  subscribedFeeds.value[index - 1] = feed1
  subscribedFeedUris.value[index - 1] = feedUri1
  subscribedFeeds.value[index] = feed2
  subscribedFeedUris.value[index] = feedUri2
}

onBeforeMount(async () => {
  const response = await requestGet.get("app.bsky.actor.getPreferences")
  for (let i = 0; i < response.res.preferences.length; i++) {
    const preference = response.res.preferences[i]
    if (preference.$type == "app.bsky.actor.defs#savedFeedsPref") {
      subscribedFeedUris.value = preference.saved
      pinnedFeedUris.value = preference.pinned
      break
    }
  }
  await getSubscribedFeedGenerators()
  await getPinnedFeedGenerators()
});

const update = async () => {
  const response = await requestGet.get("app.bsky.actor.getPreferences")
  for (let i = 0; i < response.res.preferences.length; i++) {
    if (response.res.preferences[i].$type == "app.bsky.actor.defs#savedFeedsPref") {
      response.res.preferences[i].saved = subscribedFeedUris.value
      response.res.preferences[i].pinned = pinnedFeedUris.value
      break
    }
  }
  await requestPost.post("app.bsky.actor.putPreferences", { preferences: response.res.preferences })
}

const getSubscribedFeedGenerators = async () => {
  try {
    if (!subscribedFeedUris.value) {
      return
    }
    if (subscribedFeedUris.value.length == 0) {
      return
    }
    const params = { feeds: subscribedFeedUris.value }
    const response = await requestGet.get("app.bsky.feed.getFeedGenerators", params)
    subscribedFeeds.value = response.res.feeds
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}
const getPinnedFeedGenerators = async () => {
  try {
    if (!pinnedFeedUris.value) {
      return
    }
    if (pinnedFeedUris.value.length == 0) {
      return
    }
    console.log(pinnedFeedUris.value)
    const params = { feeds: pinnedFeedUris.value }
    const response = await requestGet.get("app.bsky.feed.getFeedGenerators", params)
    pinnedFeeds.value = response.res.feeds
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