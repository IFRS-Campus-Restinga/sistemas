import api from "../../config/apiConfig"
import { extractError } from "../utils/handleAxiosError"

export interface CalendarInterface {
    id?: string
    title: string
    start: string
    end: string
    status: string
}

const CalendarService = {
    create: async (param: CalendarInterface) => {
        try {
            return await api.post('api/calendars/create/', param)
            
        } catch (error) {
            throw extractError(error)
        }
    },

    list: async (page: number = 1, param: string = '', fields: string) => {
        return await api.get('api/calendars/get/', {
            params: {
                fields,
                search: param,
                page
            }
        })
    },

    get: async (calendarId: string, fields: string) => {
        return await api.get(`api/calendars/get/${calendarId}/`, {
            params: {
                fields
            }
        })
    },

    edit: async (params: CalendarInterface, calendarId: string) => {
        return await api.put(`api/calendars/edit/${calendarId}/`, params)
    }
}

export default CalendarService