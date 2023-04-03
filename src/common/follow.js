import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export function useFollow() {
  const store = useStore()
  
  async function follow(did) {
    axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
    await axios.post("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      collection: "app.bsky.graph.follow",
      repo: store.getters.getDid,
      record: {
        subject: did,
        createdAt: new Date()}
    })
    .then(response => {
      console.log(response.data)
      store.getters.getFollows.push(did);
    })
    .catch(err => {
      console.error(err)
    })

    return {follow}
  }

  // provideでデータを登録する
  provide('srore', store)

  return { follow }
}