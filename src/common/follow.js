import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'
import { useRequestGet } from './requestGet.js'

export function useFollow(store) {
  async function follow(did) {
    try {
      const request = useRequestPost(store)
      await request.post("com.atproto.repo.createRecord", {
        collection: "app.bsky.graph.follow",
        repo: store.getters.getDid,
        record: {
          subject: did,
          createdAt: new Date()}
      })
      store.getters.getFollows.push(did)  
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }

  async function unFollow(ownDid, followDid) {
    try {
      const requestGet = useRequestGet(store)
      let response = await requestGet.get("app.bsky.actor.getProfile", { actor: followDid })
      const profile = response.res
      const requestPost = useRequestPost(store)
      await requestPost.post("com.atproto.repo.deleteRecord", {
        collection: "app.bsky.graph.follow",
        repo: ownDid,
        rkey: String(profile.viewer.following).substr(-13)
      })
      store.dispatch('removeFollow', followDid);  
    } catch (e) {
      const toast = createToaster()
      toast.error(e, { position: "top-right" })
    }
  }
  return { follow, unFollow }
}
