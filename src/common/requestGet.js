import axios from 'axios'

export function useRequestGet() {
  async function get(method, params, header) {
    console.log(method)
    //console.trace(1)
    const response = await axios.get(process.env.VUE_APP_BASE_URI + method, { params }, header)
    const res = response.data
    return { res }
  }
  return { get }
}