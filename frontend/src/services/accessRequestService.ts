import api from '../../config/apiConfig'

export interface RequestGroup {
    id: string
    name: string
}

export interface RequestInterface {
    id: string
    user_id?: string
    username: string
    email: string
    is_abstract: boolean
    access_profile: 'aluno' | 'servidor' | 'convidado' | ''
    groups: RequestGroup[]
}

const AccessRequestService = {
    getRequests: async (page: number = 1, fields: string) => {
        return await api.get('api/requests/get/', {
            params: {
                page,
                fields
            }
        })
    },

    approveRequest: async (request: RequestInterface) => {
        const { id: accessRequestId, ...approvalData } = request
        return await api.put(`api/requests/${accessRequestId}/approve/`, approvalData)
    },

    declineRequest: async (accessRequestId: string) => {
        return await api.delete(`api/requests/${accessRequestId}/decline/`)
    }
}

export default AccessRequestService
