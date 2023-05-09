<template>
  <div v-if="profile" class="displayArea mx-auto">
    <v-card class="mx-auto mt-5">
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
        <v-text-field dense v-model="profile.displayName" label="displayName"></v-text-field>
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

const store = useStore()
const requestPost = useRequestPost(store)
const requestGet = useRequestGet(store)
const toast = createToaster()


const profile = ref(null)
const avatar = ref(null)
const avatarUrl = ref(null)

onBeforeMount(async () => {
  await getProfile(store.getters.getHandle)
});

const selectAvator = async (event) => {
  const file = event.target.files[0];
  avatar.value = file;
  avatarUrl.value = URL.createObjectURL(file);
}

const getBlob = async (file) => {
  const blob = new Blob([file.value], { type: file.value.type });
  return blob;
}

const uploadImage = async (blob) => {
  const response = await requestPost.post("com.atproto.repo.uploadBlob", blob)
  return response.res.blob
}

const getProfile = async (handle) => {
  try {
    const response = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
    profile.value = response.res
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const updateProfile = async () => {
  const cid = profile.value.cid
  try {
    let params = {}
    if (!avatar.value) {
      const response = await requestGet.get("com.atproto.repo.getRecord", {
        repo: store.getters.getDid,
        collection: "app.bsky.actor.profile",
        rkey: "self"
      })

      params = {
        repo: store.getters.getDid,
        collection: "app.bsky.actor.profile",
        rkey: "self",
        record: {
          $type: "app.bsky.actor.profile",
          avatar: { cid: response.res.value.avatar.cid, mimeType: response.res.value.avatar.mimeType },
          description: profile.value.description,
          displayName: profile.value.displayName
        },
        swapRecord: cid
      }
    } else {
      const blob = await getBlob(avatar);
      const image = await uploadImage(blob)
      const avatarCid = image.ref.$link
      const mimeType = avatar.value.type

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
}

</script>