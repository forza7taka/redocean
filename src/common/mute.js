import { provide } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'

export function useMute() {
  const store = useStore()
  
  async function mute(did) {
    axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
    await axios.post("app.bsky.graph.mute", {
      user: did
    })
    .then(response => {
      console.log(response.data)
    })
    .catch(err => {
      console.error(err)
    })

    return {mute}
  }

  // provideでデータを登録する
  provide('srore', store)

  return { mute }
}