import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"

export interface Permissions {
    id: string
    name: string
}

const PermissionService = {
    list: async (page: number = 1) => {
        try {
            return api.get(`api/permissions/get/`, {
                params: {
                    data_format: 'list',
                    page
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    },

    listByGroup: async (groupId: string, page: number = 1) => {
        try {
            return api.get(`api/permissions/get/${groupId}/`, {
                params: {
                    data_format: 'list',
                    page
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    },

    notAssignedTo: async (groupId: string, page: number = 1) => {
        try {
            return api.get(`api/permissions/get/${groupId}/not_assigned/`, {
                params: {
                    data_format: 'list',
                    page
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default PermissionService