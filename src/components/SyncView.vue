<template>
  <div class="displayArea mx-auto">

    <v-toolbar :title="$t('sync.syncSettings')"></v-toolbar>
    <v-card class="mx-auto pa-4" variant="flat">
      <v-card-subtitle>
        <v-card-actions>
          <template v-if="!user">
            <v-btn @click="signInGoogle()">
              <span>
                <v-img width="150px" src="/img/google/btn_google_signin_light_normal_web@2x.png"></v-img>
              </span>
            </v-btn>
          </template>
          <template v-else>
            <v-badge offset-x="36" offset-y="40" color="transparent" class="ma-3">
              <template #badge>
                <span>{{ $t('sync.upload')}}</span>
              </template>
              <v-btn @click.prevent="parseSettings.upload()" icon><v-icon>mdi-upload</v-icon></v-btn>
            </v-badge>
            <v-badge offset-x="45" offset-y="40" color="transparent" class="ma-3">
              <template #badge>
                <span>{{ $t('sync.download' ) }}</span>
              </template>
              <v-btn @click.prevent="parseSettings.download()" icon><v-icon>mdi-download</v-icon></v-btn>
            </v-badge>
          </template>
        </v-card-actions>
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRoute } from "vue-router"
import Parse from "parse"
import { useParseSettings } from "@/common/parseSettings"

const route = useRoute()
const user = ref(null)
const parseSettings = useParseSettings()

const signInGoogle = async () => {
  const res = await Parse.Cloud.run("GoogleSignIn");
  window.location.href = res
}

onBeforeMount(async () => {
  user.value = Parse.User.current();
  if (user.value) {
    user.value.setACL(new Parse.ACL(user.value));
    return
  }
  if (route.query.code) {
    const tokens = await Parse.Cloud.run("GoogleGetID", { code: route.query.code });
    try {
      user.value = await Parse.User.logInWith('google', {
        authData: {
          id: tokens.id,
          id_token: tokens.id_token,
          access_token: tokens.access_token
        }
      });
    } catch (e) {
      alert(e)
    }
    return
  }
});
</script>
