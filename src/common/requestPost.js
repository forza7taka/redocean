import axios from 'axios'

export function useRequestPost() {
  async function post(method, params) {
    console.log(method)
    const response = await axios.post(process.env.VUE_APP_BASE_URI + method, params)
    const res = response.data
    return { res }
  }
  return { post }
}