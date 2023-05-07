<template>
  <div>
    <v-list v-if="props.users">
      <v-list-item v-for="(f, fIndex) in   props.users  " :key="fIndex">
        <v-card width="380px" class="mx-auto mt-5" elevation="20">
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
                  <v-btn v-if="!store.getters.getFollows.includes(f.did)" 
                    @click.prevent="follow(f.did)"
                    icon><v-icon>mdi-account-check</v-icon></v-btn>
                  <v-btn v-if="f.viewer && f.viewer.muted"
                    @click.prevent="unMute(f.did); f.viewer.muted = !f.viewer.muted"
                    icon><v-icon>mdi-volume-high</v-icon></v-btn>
                  <v-btn v-if="!(f.viewer && f.viewer.muted)"
                    @click.prevent=" mute(f.did); f.viewer.muted = !f.viewer.muted "
                    icon><v-icon>mdi-volume-mute</v-icon></v-btn>
                  <v-btn v-if="store.getters.getBlocks.includes(f.did)"
                    @click.prevent="unBlock(store.getters.getDid, f.did)"
                    icon><svg-icon type="mdi" :path=mdiAccountLockOpen></svg-icon></v-btn>
                  <v-btn v-if="!store.getters.getBlocks.includes(f.did)"
                    @click.prevent="block(f.did)"
                    icon><v-icon>mdi-account-cancel</v-icon></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-card-actions>
        </v-card>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccountLockOpen } from '@mdi/js'
import { useFollow } from "@/common/follow"
import { useMute } from "@/common/mute"
import { useBlock } from "@/common/block"
import { defineProps } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const { follow, unFollow } = useFollow(store)
const { mute, unMute } = useMute(store)
const { block, unBlock } = useBlock(store)
const props = defineProps({
  users: Array
})

</script>