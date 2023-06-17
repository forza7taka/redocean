<template>
    <div class="displayArea mx-auto">
        <v-toolbar title="Mute Words Setting"></v-toolbar>
        <v-card class="mx-auto pa-4" variant="flat">
            <template v-if="userSettings && userSettings.muteWords">
                <div v-for="(w, index) in userSettings.muteWords" :key="index">
                    <v-row>
                        <v-col>
                            <v-text-field label="muteWords" color="green darken-5" clearable dense v-model="w.value"
                                variant="outlined" required maxlength="15"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-btn @click="del(index)" icon="mdi-minus" size="42"></v-btn>
                        </v-col>
                    </v-row>
                </div>
                <v-btn v-if="userSettings.muteWords[userSettings.muteWords.length - 1].value" @click="add(index)" size="42"
                    icon="mdi-plus"></v-btn>
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

const add = async () => {
    userSettings.value.muteWords.push({ value: null })
}
const del = async (index) => {
    userSettings.value.muteWords.splice(index, 1)
    if (userSettings.value.muteWords.length == 0) {
        userSettings.value.muteWords = [{ value: null }]
        return
    }
}

onBeforeMount(async () => {
    userSettings.value = await settingsManager.getUser(route.params.did, route.params.handle)
    if (!userSettings.value.muteWords) {
        userSettings.value.muteWords = [{ value: null }]
        return
    }
    if (userSettings.value.muteWords.length == 0) {
        userSettings.value.muteWords = [{ value: null }]
        return
    }
});

onUnmounted(async () => {
    parseSettings.upload()
})

watch(() => userSettings, () => {
    for (let i = 0; i < settings.value.users.length; i++) {
        const user = settings.value.users[i]
        if (route.params.did == user.did) {
            storageSettings.value.users[i].muteWords = userSettings.value.muteWords
        }
    }
}, { deep: true }
);

</script>