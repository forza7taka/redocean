import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'

export function useMute(store) {
  async function mute(did) {
    try {
      const request = useRequestPost()
      await request.post(process.env.VUE_APP_BASE_URI + "app.bsky.graph.muteActor", {
        actor: did
      })
      store.getters.getMutes.push(did);
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }
  return { mute }
}