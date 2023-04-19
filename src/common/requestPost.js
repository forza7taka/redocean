import axios from 'axios'

export function useRequestPost(store) {
  async function post(method) {
    axios.defaults.headers.common['Authorization'] = `Bearer ` + store.getters.getAccessJwt
    const response = await axios.post(process.env.VUE_APP_BASE_URI + method, { param })
    const res = response.data
    return { res }
  }
  return { post }
}