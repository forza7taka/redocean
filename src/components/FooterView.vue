<template>
    <v-bottom-navigation :elevation="0">
        <v-row justify="center" rowa="auto">
            <v-col cols="auto">
                <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-login"/>
                    </template>
                    <v-list v-for="(l, index) in settings.users" :key="index" :value=index>
                        <v-list-item @click.prevent="login(index, l.server, l.handle, l.did)">
                            <template v-if="l.avatar">
                                <template v-if="l.color">
                                    <v-avatar v-if="l.color" :style="`border: 5px solid ${l.color};`">
                                    <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
                                    </v-avatar>
                                </template>
                                <template v-else>
                                    <v-avatar>
                                        <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
                                    </v-avatar>
                                </template>
                            </template>
                            {{ l.handle }}         
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
            <v-col cols="auto">
                <v-btn to="/home" icon>
                    <v-icon>mdi-home</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn to="/profile" icon>
                    <v-icon>mdi-face-profile</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn :to="`/accountSetting/${store.getters.getDid}/${store.getters.getHandle}`" icon>
                    <v-icon>mdi-cog-outline</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-dots-vertical"/>
                    </template>
                    <v-list>
                        <v-list-item>
                            <v-switch v-model="isShowRepost" label="Repost"></v-switch>
                        </v-list-item>
                        <v-list-item>
                            <v-switch v-model="isShowReply" label="Reply"></v-switch>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
    </v-bottom-navigation>
</template>
<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useStorage } from '@vueuse/core'
import { Setting } from "@/common/setting"
import { useRequestGet } from '../common/requestGet.js'
import { useRequestPost } from '../common/requestPost.js'
import { useCatchError } from '@/common/catchError'
import { useSettings } from '@/common/settings'
import { useRouter } from "vue-router"
import { Buffer } from 'buffer'

const store = useStore()

const followsCursor = ref(null)
const mutesCursor = ref(null)
const blocksCursor = ref(null)
const requestGet = useRequestGet(store)
const requestPost = useRequestPost(store)
const completed = ref(false)

const route = useRouter()

const settings = ref(new Setting())
useStorage('redocean', settings)

const passwords = ref([])
useStorage('passwords', passwords)

const settingsManager = useSettings(settings.value)

const getPassword = async (did) => {
    if (!passwords.value) {
        return null
    }
    for (let i = 0; i < passwords.value.length; i++) {
        if (did == passwords.value[i].did) {
            console.log(passwords.value[i].password)
            if (!passwords.value[i].password) {
                return null
            }
            return Buffer.from(passwords.value[i].password, 'base64').toString()
        }
    }
}


const login = async (index, server, handle, did) => {
    try {
        const password = await getPassword(did)

        store.dispatch('doSetServer', server)
        const login = await requestPost.post("com.atproto.server.createSession", {
            identifier: handle,
            password: password
        })
        store.dispatch('doCreateSession', login.res);
        store.dispatch('doSetColor', await settingsManager.getColor(login.res.did, login.res.handle));

        const profile = await requestGet.get("app.bsky.actor.getProfile", { actor: handle })
        store.dispatch('doSetProfile', profile.res);
        settings.value.users[index].did = login.res.did
        settings.value.users[index].handle = login.res.handle
        settings.value.users[index].avatar = profile.res.avatar

        while (!completed.value) {
            await getFollows(handle, followsCursor)
        }
        completed.value = false
        while (!completed.value) {
            await getMutes(mutesCursor)
        }
        completed.value = false
        while (!completed.value) {
            await getBlocks(blocksCursor)
        }
        if (route.currentRoute.value.path != '/home') {
            route.push('/home')
        } else {
            location.reload()
        }
    } catch (e) {
        console.log(e)
        const ce = useCatchError()
        ce.catchError(e)
    }
}

const getFollows = async (handle, cur) => {
    let params = {}
    if (!cur.value) {
        params = { actor: handle, limit: 100 }
    } else {
        params = { actor: handle, cursor: cur.value, limit: 100 }
    }
    const response = await requestGet.get("app.bsky.graph.getFollows", params)
    followsCursor.value = response.res.cursor
    if (response.res.follows.length == 0) {
        completed.value = true
        return
    }
    store.dispatch('doAddFollows', response.res)
}

const getMutes = async (cur) => {
    let params = {}
    if (!cur.value) {
        params = {}
    } else {
        params = { cursor: cur.value }
    }
    const response = await requestGet.get("app.bsky.graph.getMutes", params)
    mutesCursor.value = response.res.cursor
    if (response.res.mutes.length == 0) {
        completed.value = true
        return
    }
    store.dispatch('doAddMutes', response.res)
}

const getBlocks = async (cur) => {
    let params = {}
    if (!cur.value) {
        params = {}
    } else {
        params = { cursor: cur.value }
    }
    const response = await requestGet.get("app.bsky.graph.getBlocks", params)
    blocksCursor.value = response.res.cursor
    if (response.res.blocks.length == 0) {
        completed.value = true
        return
    }
    store.dispatch('doAddBlocks', response.res)
}

</script>