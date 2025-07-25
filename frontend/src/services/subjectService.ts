import api from "../../config/apiConfig"

export interface SubjectInterface {
    id?: string
    name: string
    objective: string
    menu: string
}

const SubjectService = {
    create: async (params: SubjectInterface) => {
        return api.post('api/academic/subjects/create/', params)
    },

    list: async (page: number, search: string) => {
        return await api.get('api/academic/subjects/get/', {
            params: {
                search,
                page,
                data_format: 'list'
            }
        })
    },

    get: async (subjectId: string) => {
        return await api.get(`api/academic/subjects/get/${subjectId}/`, {
            params: {
                data_format: 'details'
            }
        });
    },

    edit: async (subjectId: string, params: SubjectInterface) => {
        return await api.put(`api/academic/subjects/edit/${subjectId}/`, params)
    }
}

export default SubjectService