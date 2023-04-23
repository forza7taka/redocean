import axios from 'axios'

export function useRequestPost() {
  async function post(method, params, header) {
    console.log(method)
    console.trace(1)
    const response = await axios.post(process.env.VUE_APP_BASE_URI + method, params, header)
    const res = response.data
    return { res }
  }
  return { post }
}