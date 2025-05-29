import axios from 'axios'

export function extractError(error: any): Error {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.message
        console.log(detail)
        return new Error(detail)
    }

    return new Error('Erro desconhecido')
}
