import api from "../../config/apiConfig"

export interface PersonalInfosData {
    id?: string
    birth_date: string
    cpf: string
}

export interface AccountInfosData {
    id?: string
    telephone_number: string
    registration: string
}

export interface PersonalAccountInfosData {
    user: string
    personal_infos: PersonalInfosData
    account_infos: AccountInfosData
}

export interface PersonalAccountInfosEditData {
    user: string
    personal_infos: Partial<PersonalInfosData>
    account_infos: AccountInfosData
}

const PersonalAccountInfosService = {
    create: async (params: PersonalAccountInfosData) => {
        return await api.post('api/users/personal_account_infos/create/', params)
    },

    get: async (userId: string, fields: string) => {
        return await api.get(`api/users/personal_account_infos/get/${userId}/`, {
            params: {
                fields
            }
        })
    },

    edit: async (userId: string, params: PersonalAccountInfosEditData) => {
        return await api.put(`api/users/personal_account_infos/edit/${userId}/`, params)
    }
}

export default PersonalAccountInfosService