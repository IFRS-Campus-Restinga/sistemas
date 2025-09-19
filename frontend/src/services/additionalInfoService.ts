import api from "../../config/apiConfig"
import flattenValues from "../utils/flattenObj"

export interface AdditionalInfosInterface {
    id?: string
    user: string
    birth_date: string
    telephone_number: string
    registration: string
    cpf: string
}

const AdditionalInfoService = {
    create: async (params: AdditionalInfosInterface) => {
        return await api.post('api/users/additional_infos/create/', params)
    },

    get: async (userId: string, fields: string) => {
        let res = await api.get(`api/users/additional_infos/get/${userId}/`, {
            params: {
                fields
            }
        })

        res.data = flattenValues(res.data)

        return res
    },

    edit: async (userId: string, params: AdditionalInfosInterface) => {
        return await api.put(`api/users/additional_infos/edit/${userId}/`, params)
    }
}

export default AdditionalInfoService