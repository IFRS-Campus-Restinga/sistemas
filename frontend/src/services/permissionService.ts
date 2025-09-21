import api from "../../config/apiConfig"

export interface Permissions {
    id: string
    name: string
}

const PermissionService = {
    list: async (page: number = 1, fields: string) => {
        return api.get(`api/permissions/get/`, {
            params: {
                fields,
                page
            }
        })
    },

    listByGroup: async (groupId: string, page: number = 1, fields: string) => {
        return api.get(`api/permissions/get/${groupId}/`, {
            params: {
                fields,
                page
            }
        })
    },

    notAssignedTo: async (groupId: string, page: number = 1, fields: string) => {
        return api.get(`api/permissions/get/${groupId}/not_assigned/`, {
            params: {
                fields,
                page
            }
        })
    }
}

export default PermissionService