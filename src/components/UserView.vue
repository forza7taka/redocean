<template>
         <v-card class="mx-auto mt-5" variant="flat">

          <v-card-actions>
              <v-list-item class="w-100">                
                <template v-slot:prepend>
                  <div style="padding-right: 10px">
                    <router-link :to="`/profile/${props.user.handle}`">
                      <v-avatar color="surface-variant">
                        <v-img cover v-bind:src=props.user.avatar alt="avatar"></v-img>
                      </v-avatar>
                    </router-link>
                  </div>
                </template>

                <v-list-item-title>{{ props.user.displayName }}</v-list-item-title>
                <v-list-item-subtitle>@{{ props.user.handle }}</v-list-item-subtitle>
                <template v-slot:append>
                  <div class="justify-self-end">
                    <v-btn v-if="store.getters.getFollows.includes(props.user.did)"
                      @click.prevent="unFollow(store.getters.getDid, props.user.did)"
                      icon><v-icon>mdi-account-remove</v-icon></v-btn>
                    <v-btn v-if="!store.getters.getFollows.includes(props.user.did)" @click.prevent="follow(props.user.did)"
                      icon><v-icon>mdi-account-check</v-icon></v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-card-actions>
          </v-card>
 
      </template>

<script setup>
// import { useFollow } from "@/common/follow"
import { defineProps } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
// const { follow, unFollow } = useFollow(store)
const props = defineProps({
  user: Object
})

</script>