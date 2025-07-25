import api from "../../config/apiConfig"

export enum EventCategories {
    EMI = 'Integrado',
    ProEJA = 'ProEJA',
    GERAL = 'Geral',
}

export enum EventTypes {
    SEMANA_PEDAGOGICA = 'Semana Pedagógica',
    FERIADOS_N_LETIVO = 'Feriados e dias não letivos',
    PRAZO_FIM_NOTAS_DOC = 'Prazo final para registro de notas e entrega de documentos',
    DIAS_LETIVOS = 'Dias letivos',
    RECESSO_ESC_FERIAS = 'Recesso Escolar/Férias',
    EXAMES = 'Exames',
    CONSELHOS_CLASSE = 'Conselhos de classe',
    VESTIBULAR = 'Vestibular',
    FIM_ETAPA = 'Fim de etapa',
}

export interface EventInterface {
    id?: string
    title: string
    start: string
    end: string
    category: EventCategories
    type: EventTypes
    description?: string
    calendar: string
}

const EventService = {
    create: async (param: EventInterface) => {
        return await api.post('api/calendars/events/create/', param)
    },

    list: async (month: number = new Date().getMonth(), year: number = new Date().getFullYear()) => {
        return await api.get('api/calendars/events/get/', {
            params: {
                data_format: 'list',
                month,
                year,
            }
        })
    },

    get: async (eventId: string) => {
        return await api.get(`api/calendars/events/get/${eventId}/`, {
            params: {
                data_format: 'details'
            }
        })
    },

    edit: async (params: EventInterface, eventId: string) => {
        return await api.put(`api/calendars/events/edit/${eventId}/`, params)
    }
}

export default EventService