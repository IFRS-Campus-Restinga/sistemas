import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"

export interface Permissions {
    id: string
    name: string
}

const PermissionService = {
    list: async (page: number = 1, fields: string) => {
        try {
            return api.get(`api/permissions/get/`, {
                params: {
                    fields,
                    page
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    },

    listByGroup: async (groupId: string, page: number = 1, fields: string) => {
        try {
            return api.get(`api/permissions/get/${groupId}/`, {
                params: {
                    fields,
                    page
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    },

    notAssignedTo: async (groupId: string, page: number = 1, fields: string) => {
        try {
            return api.get(`api/permissions/get/${groupId}/not_assigned/`, {
                params: {
                    fields,
                    page
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default PermissionService