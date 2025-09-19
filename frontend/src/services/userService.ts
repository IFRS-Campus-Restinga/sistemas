import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"
import flattenValues from "../utils/flattenObj"
import type { UserInterface } from "../pages/base/Admin/userForm/UserForm"

export interface RequestGroup {
    id: string
    name: string
}

export interface visitorAccountProps {
    first_name: string
    last_name: string
    email: string
    password: string
}

export interface RequestInterface {
    id: string
    username: string
    email: string
    is_abstract: boolean
    access_profile: 'aluno' | 'servidor' | 'convidado' | ''
    groups: RequestGroup[]
}

const UserService = {
    createAccount: async (visitorData: visitorAccountProps) => {
            const params = {
                ...visitorData,
                accessProfile: 'convidado'
            }
    
            return await api.post('api/users/create/', params)
    },

    getRequests: async (page: number = 1, fields: string) => {
        try {
            return await api.get('api/users/request/get/', {
                params: {
                    page,
                    fields
                }
            })
        } catch (error) {
            throw extractError(error)
        }
    },

    approveRequest: async (request: RequestInterface) => {
        return await api.put(`api/users/request/${request.id}/approve/`, request)
    },

    declineRequest: async (requestId: string) => {
        return await api.delete(`api/users/request/${requestId}/decline/`)
    },

    get: async (userId: string, fields: string) => {
        let res = await api.get(`api/users/get/${userId}/`, {
            params: {
                fields
            }
        })

        res.data = flattenValues(res.data)

        return res
    },

    getData: async () => {
        return await api.get('api/users/get/data/')
    },

    listByAccessProfile: async (profile: string, param: string = '', page: number = 1, fields: string, active?: boolean) => {
        const queryParams = new URLSearchParams()

        if (param.trim() !== '') queryParams.append('search', param)
        queryParams.append('page', String(page))

        return api.get(`api/users/get/access_profile/${profile}/?${queryParams.toString()}`, {
            params: {
                fields,
                active
            }
        })
    },

    listByGroup: async (group: string, param: string = '', page: number = 1, fields: string, active?: boolean) => {
        const queryParams = new URLSearchParams()

        if (param.trim() !== '') queryParams.append('search', param)
        queryParams.append('page', String(page))

        return api.get(`api/users/get/group/${group}/?${queryParams.toString()}`, {
            params: {
                fields,
                active
            }
        })
    },

    edit: async (userId: string, params: UserInterface) => {
        return await api.put(`api/users/edit/${userId}/`, params)
    }
}

export default UserService
