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
            const res = await api.post('api/systems/create/', params)

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    list: async (user_id: string, page: number) => {
        try {
            const res = await api.get('api/systems/menu/', {
                params: {
                    user_id,
                    page,
                    data_format: 'list'
                }
            })

            return res
        } catch (error) {
            throw extractError(error)
        }
    },

    get: async (systemId: string) => {
        return api.get(`api/systems/get/${systemId}/`, {
            params: {
                data_format: 'details'
            }
        })
    },

    getAPIKey: async (systemId: string) => {
        return api.get(`api/systems/get/api_key/${systemId}/`)
    },

    edit: async (systemId: string, params: System) => {
        return api.put(`api/systems/edit/${systemId}/`, params)
    }
}