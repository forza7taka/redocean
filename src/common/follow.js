import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import {createToaster} from '@meforma/vue-toaster'

export function useFollow() {
  const store = useStore()
  const toast = createToaster()
  
  async function follow(did) {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
      let response = await axios.post("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
        collection: "app.bsky.graph.follow",
        repo: store.getters.getDid,
        record: {
          subject: did,
          createdAt: new Date()}
      })
      console.log(response.data)
      store.getters.getFollows.push(did);  
    } catch (e) {
      toast.show(e.response.data.error + " " + e.response.data.message, {
        type: "error",
        position: "top-right",
        duration: 8000
      })
    }

    return {follow}
  }

  // provideでデータを登録する
  provide('srore', store)
 
  return { follow }
}