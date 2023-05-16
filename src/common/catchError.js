import { createToaster } from '@meforma/vue-toaster'
export function useCatchError() {
    async function catchError(e) {
        const toast = createToaster()
        if (e.response && e.response.data && e.response.data.message) {
            toast.error(e.response.data.message, { position: "top-right" })
        } else {
            toast.error(e, { position: "top-right" })
        }
    }
    return { catchError }
}