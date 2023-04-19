import axios from 'axios'

export function useRequestGet() {
  async function get(method, params) {
    console.log(method)
    const response = await axios.get(process.env.VUE_APP_BASE_URI + method, { params })
    const res = response.data
    return { res }
  }
  return { get }
}