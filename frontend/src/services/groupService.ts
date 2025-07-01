import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"
import { type Permissions } from "./permission_service"

export interface Group {
    id: string
    name: string
    permissions: Permissions[]
}

const GroupService = {
    list: async (page: number, search: string) => {
        try {
            return await api.get('group/list/', {
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
            return await api.get(`group/get/${groupId}/`, {
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
            return api.put(`group/edit/${group_id}/`, params)
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default GroupService