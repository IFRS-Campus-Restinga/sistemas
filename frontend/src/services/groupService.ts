import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"
import { type Permissions } from "./permissionService"

export interface Group {
    id?: string
    name: string
}

export interface GroupData extends Group {
    permissionsToAdd: Permissions[]
    permissionsToRemove: Permissions[]
}

const GroupService = {
    create: async (param: GroupData) => {
        try {
            return api.post('api/groups/create/', param)
        } catch (error) {
            throw extractError(error)
        }
    },

    list: async (page: number, search: string, fields: string) => {
        try {
            return await api.get('api/groups/get/', {
                params: {
                    search,
                    page,
                    fields
                }
            })
        } catch (error) {
            throw extractError(error)
        }
    },

    get: async (groupId: string, fields: string) => {
        try {
            return await api.get(`api/groups/get/${groupId}/`, {
                params: {
                    fields
                }
            });
        } catch (error) {
            throw extractError(error);
        }
    },

    edit: async (params: GroupData, group_id: string) => {
        try {
            return api.put(`api/groups/edit/${group_id}/`, params)
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default GroupService