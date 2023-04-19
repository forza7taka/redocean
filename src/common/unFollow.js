import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'
import { useRequestGet } from './requestGet.js'

export function useUnFollow(store) {
  async function unFollow(ownDid, followDid) {
    try {
      const requestGet = useRequestGet()
      let response = await requestGet.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
          params: {
              actor: followDid
          }
      })
      const profile = response.res
      const requestPost = useRequestPost()
      await requestPost.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.deleteRecord", {
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
  return { unFollow }
}
