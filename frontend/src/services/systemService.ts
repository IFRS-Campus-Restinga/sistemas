import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"

export interface System {
    id?: string
    name: string
    system_url: string
    is_active: boolean
    secret_key: string
    current_state: string
    dev_team: string[]
    groups: string[]
}

export const SystemService = {
    create: async (params: System) => {
        try {
            const res = await api.post('system/create/', params)

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    list: async (user_id: string, page: number) => {
        try {
            const res = await api.get('api/system/menu/', {
                params: {
                    user_id,
                    page
                }
            })

            return res
        } catch (error) {
            throw extractError(error)
        }
    }
}