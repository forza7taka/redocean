import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { createToaster } from '@meforma/vue-toaster'

export function useUnFollow() {
  const store = useStore()
  const toast = createToaster()

  async function unFollow(ownDid, followDid) {

    try {
      let profile
      axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
      let response = await axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
          params: {
              actor: followDid
          }
      })
      profile = response.data
      await axios.post("https://bsky.social/xrpc/com.atproto.repo.deleteRecord", {
        collection: "app.bsky.graph.follow",
        repo: ownDid,
        rkey: String(profile.viewer.following).substr(-13)
      })
      store.dispatch('removeFollow', followDid);  
    } catch (e) {
      toast.show(e.response.data.error + " " + e.response.data.message, {
        type: "error",
        position: "top-right",
        duration: 8000
      })
    }
  }

  provide('srore', store)

  return { unFollow }
}