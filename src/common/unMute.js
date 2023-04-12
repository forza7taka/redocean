import { provide } from 'vue'
import { useStore } from 'vuex'
import { createToaster } from '@meforma/vue-toaster'
import axios from 'axios'

export function useUnMute() {
  const store = useStore()
  const toast = createToaster()

  async function unMute(did) {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
      await axios.post("https://bsky.social/xrpc/app.bsky.graph.unMuteActor", {
        actor: did
      })
      store.dispatch('removeMute', did);
    } catch (e) {
      toast.show(e.response.data.error + " " + e.response.data.message, {
        type: "error",
        position: "top-right",
        duration: 8000
      })
    }
    return { unMute }
  }

  // provideでデータを登録する
  provide('srore', store)

  return { unMute }
}