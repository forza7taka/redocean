<template>
  <div class="displayArea mx-auto">
    <v-card class="mx-auto pa-4" variant="flat">
      <v-card-title>
        Sync
      </v-card-title>
      <v-card-subtitle>
        <GoogleLogin :callback="callback" />
        <!-- <a :href="google"><v-btn icon>
            <v-icon>mdi-google</v-icon>
          </v-btn>
        </a> -->
      </v-card-subtitle>
    </v-card>
  </div>
</template>

<script setup>
import { onBeforeMount } from 'vue'



// import { useRoute } from "vue-router"
// import axios from "axios"
import Parse from "parse"
// import { useStore } from 'vuex'

// const route = useRoute()

// const store = useStore()

const callback = (response) => {
  // This callback will be triggered when the user selects or login to
  // his Google account from the popup
  console.log("Handle the response", response)
}


onBeforeMount(async () => {

  const res = await Parse.Cloud.run("GoogleSignIn");
  console.log(res)
  //  window.location.href = oauthLink;

  // const user = new Parse.User();
  // user.set("username", "my name");
  // user.set("password", "my pass");
  // user.set("email", "email@example.com");

  // // other fields can be set just like with Parse.Object
  // user.set("phone", "415-392-0202");
  // try {
  //   await user.signUp();
  //   // Hooray! Let them use the app now.
  // } catch (error) {
  //   // Show the error message somewhere and let the user try again.
  //   alert("Error: " + error.code + " " + error.message);
  // }
  // const user1 = await Parse.User.logIn("my name", "my pass");
  // console.log(user1)
  // const user = Parse.User.current();
  // if (user) {
  //   // do stuff with the user
  // } else {
  //   // show the signup or login page
  // }

  // const Setting = Parse.Object.extend("setting");
  // const setting = new Setting();
  // setting.set("userID", user.id)
  // setting.set("translationApiKey", store.getters.getTranslationApiKey)
  // setting.set("translationLang", store.getters.getTranslationLang)
  // setting.set("handed", store.getters.getHanded)
  // setting.save()

  // const AccountSettings = Parse.Object.extend("accountSettings");
  // const accountSettings = new AccountSettings();

  // accountSettings.set("userID", user.id)
  // accountSettings.set("did", "")
  // accountSettings.set("value", "")
  // accountSettings.save()
  // //did, { labels: null, color: null }
});
</script>