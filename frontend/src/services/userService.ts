import type { AxiosResponse } from "axios"
import api from "../../config/apiConfig"
import type { UserState } from "../store/userSlice"
import { extractError } from "../utils/handleAxiosError"

export interface RequestGroup {
    id: string
    Nome: string
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
    accessProfile: 'aluno' | 'servidor' | 'convidado' | ''
    groups: RequestGroup[]
}

const UserService = {
    createAccount: async (visitorData: visitorAccountProps) => {
            const params = {
                ...visitorData,
                accessProfile: 'convidado'
            }
    
            try {
                const res = await api.post('api/user/create/', params)
    
                return res
            } catch (error: any) {
                throw extractError(error)
            }
    
    },

    getRequests: async (page: number = 1) => {
        try {
            return await api.get('api/user/request/get/', {
                params: {
                    page,
                    data_format: 'request'
                }
            })
        } catch (error) {
            throw extractError(error)
        }
    },

    approveRequest: async (request: RequestInterface) => {
        try {
            return await api.put(`api/user/request/${request.id}/approve/`, request)
        } catch (error) {
            throw extractError(error)
        }
    },

    declineRequest: async (requestId: string) => {
        try {
            return await api.delete(`api/user/request/${requestId}/decline/`)
        } catch (error) {
            throw extractError(error)
        }
    },

    getData: async (): Promise<AxiosResponse<UserState, Error>> => {
        return await api.get<UserState>('api/user/data/')
    },

    searchOrListUsers: async (profile: string, param: string = '', page: number = 1, data_format: string, active?: boolean) => {
        const queryParams = new URLSearchParams()

        if (param.trim() !== '') queryParams.append('search', param)
        queryParams.append('page', String(page))

        return api.get(`api/user/get/access_profile/${profile}/?${queryParams.toString()}`, {
            params: {
                data_format,
                active
            }
        })
    },
}

export default UserService
