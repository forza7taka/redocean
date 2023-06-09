import axios from 'axios'
import urlJoin from 'url-join'
export function useRequestPost(store) {
  async function post(method, params, header) {
    console.log(method)
    if (!store.getters.getServer) {
      return 
    }
    const url = urlJoin(store.getters.getServer, 'xrpc', method)
    const response = await axios.post(url, params, header)
    const res = response.data
    return { res }
  }
  return { post }
}