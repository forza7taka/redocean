import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { createToaster } from '@meforma/vue-toaster'


export function useMute() {
  const store = useStore()
  const toast = createToaster()

  async function mute(did) {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
      await axios.post(process.env.VUE_APP_BASE_URI + "app.bsky.graph.muteActor", {
        actor: did
      })
      store.getters.getMutes.push(did);
    } catch (e) {
      toast.show(e.response.data.error + " " + e.response.data.message, {
        type: "error",
        position: "top-right",
        duration: 8000
      })
    }
    return { mute }
  }

  // provideでデータを登録する
  provide('srore', store)

  return { mute }
}