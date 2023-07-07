<template>
    <v-bottom-navigation :elevation="0">
        <v-row justify="center" rowa="auto">
            <v-col cols="auto">
                <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon>
                            <v-icon>mdi-login</v-icon>
                        </v-btn>
                    </template>
                    <div v-for="(l, index) in settings.users" :key="index" :value=index>
                        <v-list>
                            <v-list-item>
                                <v-avatar v-if="l.color" :style="`border: 5px solid ${l.color};`">
                                    <v-img cover v-bind:src=l.avatar alt="avatar"></v-img>
                                </v-avatar>
                                {{ l.handle }}
                            </v-list-item>
                        </v-list>
                    </div>
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
                <v-btn :to="`/accountSetting/${store.getters.did}/${store.getters.getHandle}`" icon>
                    <v-icon>mdi-cog-outline</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-bottom-navigation>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useStorage } from '@vueuse/core'
import { Setting } from "@/common/setting"

const settings = ref(new Setting())
const store = useStore()
useStorage('redocean', settings)

</script>