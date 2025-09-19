import api from "../../config/apiConfig"
import flattenValues from "../utils/flattenObj"
import { extractError } from "../utils/handleAxiosError"

export interface System {
    id?: string
    name: string
    system_url: string
    is_active: boolean
    secret_key: string
    current_state: string
    dev_team: string[]
}

export const SystemService = {
    create: async (params: System) => {
        try {
            const res = await api.post('api/systems/create/', params)

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    list: async (user_id: string, page: number, fields: string) => {
        try {
            let res = await api.get('api/systems/get/', {
                params: {
                    user_id,
                    page,
                    fields
                }
            })

            res.data = flattenValues(res.data) 

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    get: async (systemId: string, fields: string) => {
        return api.get(`api/systems/get/${systemId}/`, {
            params: {
                fields
            }
        })
    },

    edit: async (systemId: string, params: System) => {
        return api.put(`api/systems/edit/${systemId}/`, params)
    }
}