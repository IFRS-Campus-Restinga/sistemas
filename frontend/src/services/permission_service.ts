import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"

export interface Permissions {
    id: string
    name: string
}

const PermissionService = {
    exclude: async (groupId: string) => {
        try {
            return api.get(`group/get/${groupId}/permissions/not_assigned/`, {
                params: {
                    data_format: 'list'
                }
            })
            
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default PermissionService