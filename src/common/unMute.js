import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export function useUnMute() {
  const store = useStore()
  
  async function unMute(did) {
    axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
    await axios.post("app.bsky.graph.unmute", {
      user: did
    })
    .then(response => {
      console.log(response.data)
    })
    .catch(err => {
      console.error(err)
    })

    return {unMute}
  }

  // provideでデータを登録する
  provide('srore', store)

  return { unMute }
}