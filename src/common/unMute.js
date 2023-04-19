import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'

export function useUnMute(store) {
  async function unMute(did) {
    try {
      const request = useRequestPost()
      await request.post(process.env.VUE_APP_BASE_URI + "app.bsky.graph.unMuteActor", {
        actor: did
      })
      store.dispatch('removeMute', did);
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }
  return { unMute }
}
