import type { AxiosResponse } from "axios"
import api from "../../config/apiConfig"
import type { UserState } from "../store/userSlice"

const UserService = {
    getData: async (): Promise<AxiosResponse<UserState, Error>> => {
        return await api.get<UserState>('api/user/data/')
    },

    searchOrListUsers: async (group: string, param: string = '', page: number = 1, data_format: string) => {
        const queryParams = new URLSearchParams()

        if (param.trim() !== '') queryParams.append('search', param)
        queryParams.append('page', String(page))

        return api.get(`api/user/list/${group}/?${queryParams.toString()}`, {
            params: {
                data_format
            }
        })
    },
}

export default UserService
