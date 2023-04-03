<template>
  <div>
    <v-list>
      <v-list-item v-for="(f, fIndex) in users" :key="fIndex">
        <v-card width="400px" class="mx-auto mt-5"  elevation="20">
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

              <v-list-item-title>{{f.displayName}}</v-list-item-title>
              <v-list-item-subtitle>@{{f.handle}}</v-list-item-subtitle>
              <template v-slot:append>
                <div class="justify-self-end">
                  <v-btn v-if="this.$store.getters.getFollows.includes(f.did)" 
                  @click.prevent="unFollow(this.$store.getters.getDid, f.did)">UnFollow</v-btn>
                  <v-btn v-if="!this.$store.getters.getFollows.includes(f.did)"
                   @click.prevent="follow(f.did)">Follow</v-btn>
                  <!-- <v-btn v-if="f.viewer && f.viewer.muted" @click.prevent="">UnMute</v-btn>
                  <v-btn v-if="!(f.viewer && f.viewer.muted)" @click.prevent="mute(f.did)">Mute</v-btn> -->
                </div>
              </template>
            </v-list-item>
          </v-card-actions>
        </v-card>
      </v-list-item>
    </v-list>

  </div>
</template>

<script>
import { useFollow } from "../common/follow"
import { useUnFollow } from "../common/unFollow"
import { useMute } from "../common/mute"
import { useUnMute } from "../common/unMute"
import { provide} from 'vue'
import { useStore } from 'vuex'
export default {
  components: {
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
    }
  },
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  methods: {

  }
}
</script>