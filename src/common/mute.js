import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'

export function useMute(store) {
  async function mute(did) {
    try {
      const request = useRequestPost(store)
      await request.post("app.bsky.graph.muteActor", {
        actor: did
      })
      store.getters.getMutes.push(did);
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }

  async function unMute(did) {
    try {
      const request = useRequestPost(store)
      await request.post("app.bsky.graph.unMuteActor", {
        actor: did
      })
      store.dispatch('removeMute', did);
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }
  return { mute, unMute }
}