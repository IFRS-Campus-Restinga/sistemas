import type { AxiosResponse } from "axios"
import api from "../../config/apiConfig"
import type { UserState } from "../store/userSlice"
import { extractError } from "../utils/handleAxiosError"

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
    
            try {
                const res = await api.post('api/users/create/', params)
    
                return res
            } catch (error: any) {
                throw extractError(error)
            }
    
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
        try {
            return await api.put(`api/users/request/${request.id}/approve/`, request)
        } catch (error) {
            throw extractError(error)
        }
    },

    declineRequest: async (requestId: string) => {
        try {
            return await api.delete(`api/users/request/${requestId}/decline/`)
        } catch (error) {
            throw extractError(error)
        }
    },

    getData: async (): Promise<AxiosResponse<UserState, Error>> => {
        return await api.get<UserState>('api/users/data/')
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
}

export default UserService
