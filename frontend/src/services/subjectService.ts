import api from "../../config/apiConfig"

export interface SubjectInterface {
    id?: string
    name: string
    objective: string
    menu: string
    code: string
}

const SubjectService = {
    create: async (params: SubjectInterface) => {
        return api.post('api/academic/subjects/create/', params)
    },

    list: async (page: number, search: string, fields: string) => {
        return await api.get('api/academic/subjects/get/', {
            params: {
                search,
                page,
                fields
            }
        })
    },

    get: async (subjectId: string, fields: string) => {
        return await api.get(`api/academic/subjects/get/${subjectId}/`, {
            params: {
                fields
            }
        });
    },

    edit: async (subjectId: string, params: SubjectInterface) => {
        return await api.put(`api/academic/subjects/edit/${subjectId}/`, params)
    }
}

export default SubjectService