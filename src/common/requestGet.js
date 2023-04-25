import axios from 'axios'
import urlJoin from 'url-join'
export function useRequestGet(store) {
  async function get(method, params, header) {
    console.log(method)
    const url = urlJoin(store.getters.getServer, 'xrpc', method)
    const response = await axios.get(url, { params }, header)
    const res = response.data
    return { res }
  }
  return { get }
}