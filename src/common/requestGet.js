import axios from 'axios'

export function useRequestGet(store) {
  async function get(method, params, header) {
    console.log(method)
    //console.trace(1)               
    //console.log(store.getters.getServer)
    const response = await axios.get(store.getters.getServer + "/xrpc/" + method, { params }, header)
    const res = response.data
    return { res }
  }
  return { get }
}