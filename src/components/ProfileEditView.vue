<template>
  <div>
    <v-card width="400px" class="mx-auto mt-5">
      <template v-slot:prepend>
        <v-avatar color="grey" size="150" rounded="0">
          <v-img v-if="!avatar" cover v-bind:src=profile.avatar alt="avatar"></v-img>
          <v-img v-if="avatar" cover v-bind:src=avatarUrl alt="avatar"></v-img>
        </v-avatar>
      </template>
      <v-card-actions>
        <v-label for="fileInput" class="v-btn v-btn--outlined"><v-icon>mdi-upload</v-icon></v-label>
        <v-file-input :v-model=[avatar] accept="image/*" id="fileInput" style="display: none;" @change="selectAvator"
          :multiple=false prepend-icon="mdi-upload"></v-file-input>
      </v-card-actions>
      <v-card-text class="text-pre-wrap">
        <v-text-field v-model="profile.displayName" label="displayName"></v-text-field>
        <v-textarea counter v-model="profile.description" label="description"></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-btn icon @click="updateProfile"><v-icon>mdi-content-save</v-icon></v-btn>
        <!--        <v-btn icon @click="createInviteCode"><v-icon>mdi-content-save</v-icon></v-btn>-->
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestPost } from '../common/requestPost.js'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster';

const requestPost = useRequestPost()
const requestGet = useRequestGet()
const toast = createToaster()
const store = useStore()

let avatar = ref(null)
let avatarUrl = ref(null)
let profile = ref(null)

onBeforeMount(async () => {
  getProfile(this.$store.getters.getHandle)
});

// const createInviteCode = async () => {
//   try {
//     let response = await requestPost.post("com.atproto.server.createInviteCod", {
//       params: {
//         useCount: 5
//       }
//     })
//   } catch (e) {
//     toast.error(e, { position: "top-right" })
//   }
// }

const selectAvator = async (event) => {
  const file = event.target.files[0];
  avatar = file;
  avatarUrl = URL.createObjectURL(file);
}

const getBlob = async (file) => {
  const blob = new Blob([file], { type: file.type });
  return blob;
}

const uploadImage = async (blob) => {
  const response = await requestPost.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.uploadBlob", blob)
  return response.res.blob
}

const getProfile = async (handle) => {
  try {
    let response = await requestGet.get(process.env.VUE_APP_BASE_URI + "app.bsky.actor.getProfile", {
      params: {
        actor: handle
      }
    })
    profile = response.res
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const updateProfile = async () => {
  const cid = profile.value.cid
  try {
    let params = {}
    if (!avatar.value) {

      let response = await requestGet.get("com.atproto.repo.getRecord", {
        params: {
          repo: store.getters.getDid,
          collection: "app.bsky.actor.profile",
          rkey: "self"
        }
      })

      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.actor.profile",
        rkey: "self",
        record: {
          $type: "app.bsky.actor.profile",
          avatar: { cid: response.res.avatar.cid, mimeType: response.res.avatar.mimeType },
          description: profile.value.description,
          displayName: profile.value.displayName
        },
        swapRecord: cid
      }
    } else {
      const blob = await getBlob(avatar);
      const image = await uploadImage(blob)
      let avatarCid = image.ref.$link
      let mimeType = avatar.value.type

      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.actor.profile",
        rkey: "self",
        record: {
          $type: "app.bsky.actor.profile",
          avatar: { cid: avatarCid, mimeType: mimeType },
          description: profile.value.description,
          displayName: profile.value.displayName
        },
        swapRecord: cid
      }
    }
    await requestPost.post("com.atproto.repo.putRecord", params)
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

</script>