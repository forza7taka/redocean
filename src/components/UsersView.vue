<template>
  <div>
    <v-list v-if="props.users">
      <v-list-item v-for="(f, fIndex) in   props.users  " :key="fIndex">
        <v-card class="mx-auto mt-5" variant="flat">
          <v-card-actions>
            <v-list-item class="w-100">

              <template v-slot:prepend>
                <div style="padding-right: 10px">
                  <router-link :to="`/profile/${f.handle}`">
                    <v-avatar color="surface-variant">
                      <v-img cover v-bind:src=f.avatar alt="avatar"></v-img>
                    </v-avatar>
                  </router-link>
                </div>
              </template>

              <v-list-item-title>{{ f.displayName }}</v-list-item-title>
              <v-list-item-subtitle>@{{ f.handle }}</v-list-item-subtitle>
              <template v-slot:append>
                <div class="justify-self-end">
                  <v-btn v-if="store.getters.getFollows.includes(f.did)"
                    @click.prevent="unFollow(store.getters.getDid, f.did)"
                    icon><v-icon>mdi-account-remove</v-icon></v-btn>
                  <v-btn v-if="!store.getters.getFollows.includes(f.did)" @click.prevent="follow(f.did)"
                    icon><v-icon>mdi-account-check</v-icon></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-card-actions>
        </v-card>
        <v-divider/>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import { useFollow } from "@/common/follow"
import { defineProps } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const { follow, unFollow } = useFollow(store)
const props = defineProps({
  users: Array
})

</script>