<template>
  <div class="displayArea mx-auto">
    <v-card variant="flat">
      <v-card-text>
        <v-row>
          <v-col v-for="(c, index) in inviteCodes" :key="index" cols="12" md="6" lg="4">
            <v-card class="mx-auto pa-4 py-5" variant="flat">
              <v-card-subtitle class="py-2" @click='copyToClipboard(c.code)'>
                <v-label v-if="c.available === c.uses.length" class="strike-through">{{ c.code
                }}</v-label>
                <v-label v-if="c.available != c.uses.length">{{ c.code }}</v-label>
              </v-card-subtitle>
              <v-card-subtitle>avaival:{{ c.available }}</v-card-subtitle>
              <v-card-subtitle>uses:{{ c.uses.length }}</v-card-subtitle>
              <div v-for="(u, uIndex) in  c.uses" :key="uIndex">
                <v-card-text>
                  {{ u.usedBy }}
                  <div v-for="(h, hIndex) in  u.handles" :key="hIndex">
                    {{ h }}
                  </div>
                </v-card-text>
              </div>
              <v-text-field label="remark" clearable dense v-model="c.remark" @input="onInputRemark"
                variant="outlined"></v-text-field>
            </v-card>
            <v-divider />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>
import axios from 'axios'
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRequestGet } from '../common/requestGet.js'
import { createToaster } from '@meforma/vue-toaster'
import { useStorage } from '@vueuse/core'
import { useClipboard } from '@vueuse/core'
import { useCatchError } from '@/common/catchError';

const { copy } = useClipboard()

const store = useStore()
const toast = createToaster()
const requestGet = useRequestGet(store)

const inviteCodes = ref(new Array())

const inviteRemarks = ref([])
const storageInviteRemarks = useStorage('inviteRemarks', inviteRemarks, undefined,
  {
    serializer: {
      read: (v) => new Map(JSON.parse(v)),
      write: (v) => v instanceof Map ? JSON.stringify([...v]) : JSON.stringify(v)
    },
  })

const copyToClipboard = async (value) => {
  try {
    await copy(value)
    toast.success('copied', { position: "top-right" })
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)
  }
}

const onInputRemark = () => {
  let remarks = []
  inviteCodes.value.forEach(el => {
    remarks.push({ code: el.code, remark: el.remark })
  })
  storageInviteRemarks.value = remarks
}

onBeforeMount(async () => {
  await getInviteCodes()
  let codes = ref(new Array())
  if (storageInviteRemarks.value) {
    storageInviteRemarks.value.forEach(el => {
      inviteRemarks.value.set(el.code, el.remark)
    })
  }

  for (const el of inviteCodes.value) {
    const remark = inviteRemarks.value.get(el.code);
    let uses = [];
    for (const u of el.uses) {
      const response = await axios.get("https://plc.directory/" + u.usedBy + "/log");
      let handles = [];
      for (const d of response.data) {
        handles.push(d.alsoKnownAs);
      }
      uses.push({ usedBy: u.usedBy, handles: handles });
    }
    const code = { code: el.code, available: el.available, uses: uses, remark: remark };
    codes.value.push(code);
  }
  inviteCodes.value = codes.value
});

const getInviteCodes = async () => {
  try {
    const response = await requestGet.get("com.atproto.server.getAccountInviteCodes", {})
    inviteCodes.value = response.res.codes
  } catch (e) {
    const ce = useCatchError()
    ce.catchError(e)

  }
}

</script>

<style>
.strike-through {
  text-decoration: line-through;
}
</style>