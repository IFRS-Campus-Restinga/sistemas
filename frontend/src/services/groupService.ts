import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"
import { type Permissions } from "./permission_service"

export interface Group {
    id?: string
    name: string
    permissions: Permissions[]
}

const GroupService = {
    create: async (param: Group) => {
        try {
            return api.post('api/group/create/', param)
        } catch (error) {
            throw extractError(error)
        }
    },

    list: async (page: number, search: string) => {
        try {
            return await api.get('api/group/get/', {
                params: {
                    search,
                    page,
                    data_format: 'list'
                }
            })
        } catch (error) {
            throw extractError(error)
        }
    },

    get: async (groupId: string) => {
        try {
            return await api.get(`api/group/get/${groupId}/`, {
                params: {
                    data_format: 'details'
                }
            });
        } catch (error) {
            throw extractError(error);
        }
    },

    edit: async (params: Group, group_id: string) => {
        try {
            return api.put(`api/group/edit/${group_id}/`, params)
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default GroupService