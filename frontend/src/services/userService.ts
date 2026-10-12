import api from "../../config/apiConfig"
import flattenValues from "../utils/flattenObj"
import type { UserInterface } from "../pages/userForm/UserForm"

export interface visitorAccountProps {
    first_name: string
    last_name: string
    email: string
    password: string
}

const UserService = {
    createAccount: async (visitorData: visitorAccountProps) => {
            const params = {
                ...visitorData,
                accessProfile: 'convidado'
            }
    
            return await api.post('api/users/create/', params)
    },

    confirmEmail: async (confirmationId: string, confirmationCode: string) => {
        return await api.post(
            `api/users/email-confirmation/${confirmationId}/`,
            { confirmation_code: confirmationCode }
        )
    },

    regenerateEmailConfirmation: async (confirmationId: string) => {
        return await api.put(
            `api/users/email-confirmation/${confirmationId}/regenerate/`
        )
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
