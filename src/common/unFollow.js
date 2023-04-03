import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export function useUnFollow() {
  const store = useStore()
  
  async function unFollow(ownDid, followDid) {
    let profile
    axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
    await axios.get('https://bsky.social/xrpc/app.bsky.actor.getProfile', {
        params: {
            actor: followDid
        }
    })
    .then(response => {
       profile = response.data
       console.log(profile)
    })
    .catch(err => {
      console.error(err)
    })

    await axios.post("https://bsky.social/xrpc/com.atproto.repo.deleteRecord", {
      collection: "app.bsky.graph.follow",
      repo: ownDid,
      rkey: String(profile.viewer.following).substr(-13)
    })
    .then(response => {
      store.dispatch('removeFollow', followDid);
      console.log(response.data)
    })
    .catch(err => {
      console.error(err)
    })
  }

  provide('srore', store)

  return { unFollow }
}