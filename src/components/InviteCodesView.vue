<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col v-for="(c, index) in inviteCodes" :key="index" cols="12" md="6" lg="4">
          <v-card width="380px" class="mx-auto pa-4 py-5">
            <v-card-subtitle class="py-2" @click='copyToClipboard(c.code)'>
              <v-label v-if="c.available === c.uses.length" class="strike-through">{{ c.code
              }}</v-label>
              <v-label v-if="c.available != c.uses.length">{{ c.code }}</v-label>
            </v-card-subtitle>
            <v-card-subtitle>avaival:{{ c.available }}</v-card-subtitle>
            <v-card-subtitle>uses:{{ c.uses.length }}</v-card-subtitle>
            <div v-for="(u, uIndex) in  c.uses" :key="uIndex">
            <v-card-subtitle>used by :<a :href="`https://plc.directory/${u.usedBy}/log`">{{ u.usedBy }}</a></v-card-subtitle>
            </div>
            <v-text-field label="remark" clearable dense v-model="c.remark" @input="onInputRemark"></v-text-field>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster'
import { useStorage } from '@vueuse/core'
import { useClipboard } from '@vueuse/core'
const { copy } = useClipboard()

const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet(store)

const inviteCodes = ref(new Array())

const remarkMap = ref(new Map())
const strageRemark  = useStorage('strageRemarkMap', [])

const copyToClipboard = async (value) => {
  try {
    await copy(value)
    toast.success('copied', { position: "top-right" })
  } catch (e) {
    toast.error(e, { position: "top-right" })
  }
}

const onInputRemark = () => {
  let remarks = []
  inviteCodes.value.forEach(el => {
    remarks.push({ code: el.code, remark: el.remark })
  })
  strageRemark.value = remarks
}

onBeforeMount(async () => {
  await getInviteCodes()
  let codes = ref(new Array())
  if (strageRemark.value) {
    strageRemark.value.forEach(el => {
      remarkMap.value.set(el.code, el.remark)
    })    
  }

  inviteCodes.value.forEach(async el => {
    const remark = remarkMap.value.get(el.code)
    const code = { code: el.code, available: el.available, uses: el.uses, remark: remark }
    codes.value.push(code)
  });
  inviteCodes.value = codes.value
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

<style>
.strike-through {
  text-decoration: line-through;
}
</style>