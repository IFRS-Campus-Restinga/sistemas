import api from "../../config/apiConfig"
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
        return api.post('api/groups/create/', param)
    },

    list: async (page: number, search: string, fields: string) => {
        return await api.get('api/groups/get/', {
            params: {
                search,
                page,
                fields
            }
        })
    },

    get: async (groupId: string, fields: string) => {
        return await api.get(`api/groups/get/${groupId}/`, {
            params: {
                fields
            }
        });
    },

    getAvailable: async (userId: string, page: number, fields: string) => {
        return await api.get(`api/groups/get/available/${userId}/`, {
            params: {
                fields,
                page
            }
        });
    },

    edit: async (params: GroupData, group_id: string) => {
        return api.put(`api/groups/edit/${group_id}/`, params)
    }
}

export default GroupService