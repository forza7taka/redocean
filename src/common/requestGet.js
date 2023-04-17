import { inject } from 'vue';
import axios from 'axios'

export function useRequestGet() {
  const store = inject("store")
  async function get(method, params) {
    console.log(method)
    axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
    const response = await axios.get(process.env.VUE_APP_BASE_URI + method, { params })
    const res = response.data
    return { res }
  }

  return { get }
}