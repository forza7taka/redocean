import axios from 'axios'

export function useRequestPost(store) {
  async function post(method, params, header) {
    console.log(method)
    console.trace(1)
    console.log(store.getters.getServer)
    const response = await axios.post(store.getters.getServer + "/xrpc/" + method, params, header)
    const res = response.data
    return { res }
  }
  return { post }
}