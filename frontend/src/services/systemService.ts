import api from "../../config/apiConfig"
import flattenValues from "../utils/flattenObj"

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
        return await api.post('api/systems/create/', params)
    },

    list: async (user_id: string, page: number, fields: string) => {
        let res = await api.get('api/systems/get/', {
            params: {
                user_id,
                page,
                fields
            }
        })

        res.data = flattenValues(res.data) 

        return res
    },

    get: async (systemId: string, fields: string) => {
        return api.get(`api/systems/get/${systemId}/`, {
            params: {
                fields
            }
        })
    },

    get_url: async (systemId: string) => {
        return api.get(`api/systems/get_url/${systemId}/`)
    },

    edit: async (systemId: string, params: System) => {
        return api.put(`api/systems/edit/${systemId}/`, params)
    }
}