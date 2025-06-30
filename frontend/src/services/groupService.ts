import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"


const GroupService = {
    list: async (page: number) => {
        try {
            const res = await api.get('user/groups/list/', {
                params: {
                    page,
                    data_format: 'list'
                }
            })

            return res
        } catch (error) {
            throw extractError(error)
        }
    }
}

export default GroupService