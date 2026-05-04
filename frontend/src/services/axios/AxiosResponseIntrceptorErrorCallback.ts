import type { AxiosError } from 'axios'

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    /** handle response error here */
    console.error('error', JSON.stringify(error))
}

export default AxiosResponseIntrceptorErrorCallback
