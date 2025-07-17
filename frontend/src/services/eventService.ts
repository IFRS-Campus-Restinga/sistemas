import api from "../../config/apiConfig"

export interface EventInterface {
    id?: string
    title: string
    start: string
    end: string
    category: string
    type: string
    description: string
}

const EventService = {
    create: async (param: EventInterface) => {
        return await api.post('api/calendar/event/create/', param)
    },

    list: async (month: number = new Date().getMonth(), year: number = new Date().getFullYear()) => {
        return await api.get('api/calendar/event/get/', {
            params: {
                data_format: 'list',
                month,
                year,
            }
        })
    },

    get: async (eventId: string) => {
        return await api.get(`api/calendar/event/get/${eventId}/`, {
            params: {
                data_format: 'details'
            }
        })
    },

    edit: async (params: EventInterface, eventId: string) => {
        return await api.put(`api/calendar/event/edit/${eventId}/`, params)
    }
}

export default EventService