<template>
    <div class="displayArea mx-auto">
        <v-toolbar title="Push Notification Setting"></v-toolbar>
        <v-card class="mx-auto pa-4" variant="flat">
            <template v-if="userSettings && userSettings.push">
                <v-switch v-model="userSettings.push.enable" label="Push Notification"
                    @change="changeEnablePushNotification"></v-switch>
                <v-switch v-model="userSettings.push.enableFollowed" label="Followed Push Notification"></v-switch>
                <v-switch v-model="userSettings.push.enableReposted" label="Reposted Push Notification"></v-switch>
                <v-switch v-model="userSettings.push.enableReplied" label="Replied Push Notification"></v-switch>
                <v-switch v-model="userSettings.push.enableLiked" label="Liked Push Notification"></v-switch>
                <v-switch v-model="userSettings.push.enableMention" label="Mention Push Notification"></v-switch>
            </template>
        </v-card>
    </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useSettings } from '@/common/settings'
import { useParseSettings } from "@/common/parseSettings"
import { Setting } from "@/common/setting"

const parseSettings = useParseSettings()

const route = useRoute()

const settings = ref(new Setting())

const storageSettings = useStorage('redocean', settings)
const settingsManager = useSettings(settings.value)
const userSettings = ref(null)

onBeforeMount(async () => {
    userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
    if (!userSettings.value.push) {
        userSettings.value.push = {}
        return
    }
});

onUnmounted(async () => {
    parseSettings.upload()
})

const changeEnablePushNotification = async () => {
    userSettings.value.push.enableFollowed = userSettings.value.push.enable
    userSettings.value.push.enableReposted = userSettings.value.push.enable
    userSettings.value.push.enableReplied = userSettings.value.push.enable
    userSettings.value.push.enableLiked = userSettings.value.push.enable
    userSettings.value.push.enableMention = userSettings.value.push.enable
    for (let i = 0; i < settings.value.users.length; i++) {
        const user = settings.value.users[i]
        if (route.params.did == user.did) {
            storageSettings.value.users[i].color = userSettings.value.color
            storageSettings.value.users[i].labels = userSettings.value.labels
            storageSettings.value.users[i].push = userSettings.value.push
            storageSettings.value.users[i].muteWords = userSettings.value.muteWords
        }
    }
}


watch(() => userSettings, () => {
    for (let i = 0; i < settings.value.users.length; i++) {
        const user = settings.value.users[i]
        if (route.params.did == user.did) {
            // storageSettings.value.users[i].color = userSettings.value.color
            // storageSettings.value.users[i].labels = userSettings.value.labels
            storageSettings.value.users[i].push = userSettings.value.push
        }
    }
}, { deep: true }
);

</script>