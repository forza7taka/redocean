<template>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col v-for="(c, index) in inviteCodes" :key="index" cols="12" md="6" lg="4">
              <v-card width="400px" class="mx-auto pa-4 py-5">
                <v-card-subtitle class="py-2">code:{{ c.code }}        <v-btn @click='copy(c.code)' icon size=12><v-icon>mdi-content-copy</v-icon></v-btn>
   </v-card-subtitle>
                    <v-card-subtitle>avaival:{{ c.available }}</v-card-subtitle>
                <v-card-subtitle>uses:{{ c.uses.length }}</v-card-subtitle>
                    <v-text-field label="remark" clearable dense
                      v-model="c.remark"></v-text-field>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
</template>
<script setup>
import { ref, onBeforeMount} from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster'
import { useStorage } from '@vueuse/core'
import { useClipboard } from '@vueuse/core'
const { copy} = useClipboard()

const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet(store)

const inviteCodes = ref(new Array())

const storageInviteCodes = useStorage('storageInviteCodes', inviteCodes)

onBeforeMount(async () => {
    await getInviteCodes()

    if (!storageInviteCodes.value) {
        return
    }
    let codes = ref(new Array())
    inviteCodes.value.codes.forEach(el => {
        const code = { code: el.code, available: el.available, uses: el.uses, remarks: null }
        codes.value.pushu(code)
    });
});

const getInviteCodes = async () => {
    try {
        const response = await requestGet.get("com.atproto.server.getAccountInviteCodes", {})
        inviteCodes.value = response.res.codes
    } catch (e) {
        toast.error(e, { position: "top-right" })
    }
}
</script>