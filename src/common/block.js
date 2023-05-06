import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'
import { useRequestGet } from './requestGet.js'

export function useBlock(store) {
  async function block(did) {
    try {
      const request = useRequestPost(store)
      await request.post("com.atproto.repo.createRecord", {
        collection: "app.bsky.graph.block",
        repo: store.getters.getDid,
        record: {
          subject: did,
          createdAt: new Date()}
      })
      store.getters.getBlocks.push(did)  
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }

  async function unBlock(ownDid, blockDid) {
    try {
      const requestGet = useRequestGet(store)
      let response = await requestGet.get("app.bsky.actor.getProfile", { actor: blockDid })
      const profile = response.res
      const requestPost = useRequestPost(store)
      await requestPost.post("com.atproto.repo.deleteRecord", {
        collection: "app.bsky.graph.block",
        repo: ownDid,
        rkey: String(profile.viewer.blocking).substr(-13)
      })
      store.dispatch('removeBlock', blockDid);  
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }
  return { block, unBlock }
}
