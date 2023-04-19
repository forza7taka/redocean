import { createToaster } from '@meforma/vue-toaster'
import { useRequestPost } from './requestPost.js'

export function useFollow(store) {
  async function follow(did) {
    try {
      const request = useRequestPost()
      await request.post(process.env.VUE_APP_BASE_URI + "com.atproto.repo.createRecord", {
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
  return { follow }
}
