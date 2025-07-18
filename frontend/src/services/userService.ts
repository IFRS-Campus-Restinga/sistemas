import type { AxiosResponse } from "axios"
import api from "../../config/apiConfig"
import type { UserState } from "../store/userSlice"
import { extractError } from "../utils/handleAxiosError"

export interface RequestGroup {
    id: string
    Nome: string
}

export interface RequestInterface {
    id: string
    username: string
    email: string
    accessProfile: 'aluno' | 'servidor' | 'convidado' | ''
    groups: RequestGroup[]
}

const UserService = {
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

    searchOrListUsers: async (profile: string, param: string = '', page: number = 1, data_format: string) => {
        const queryParams = new URLSearchParams()

        if (param.trim() !== '') queryParams.append('search', param)
        queryParams.append('page', String(page))

        return api.get(`api/user/get/access_profile/${profile}/?${queryParams.toString()}`, {
            params: {
                data_format
            }
        })
    },
}

export default UserService
