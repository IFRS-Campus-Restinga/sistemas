import api from '../../config/apiConfig'

export interface BindRequest extends Record<string, string> {
    id: string
    username: string
    email: string
    access_profile: string
}

export interface BindRequestPage {
    count: number
    next: string | null
    previous: string | null
    results: BindRequest[]
}

export interface BindRequestCount {
    count: number
}

export interface PendingBindRequest {
    pending: boolean
}

const BindRequestService = {
    getRequests: async (page: number = 1) => {
        return await api.get<BindRequestPage>('api/requests/bind/', {
            params: { page }
        })
    },

    getRequestCount: async () => {
        return await api.get<BindRequestCount>('api/requests/bind/count/')
    },

    getPendingRequest: async () => {
        return await api.get<PendingBindRequest>('api/requests/bind/pending/')
    },

    approveRequest: async (requestId: string) => {
        return await api.put(`api/requests/bind/${requestId}/approve/`)
    },

    rejectRequest: async (requestId: string) => {
        return await api.delete(`api/requests/bind/${requestId}/reject/`)
    }
}

export default BindRequestService
