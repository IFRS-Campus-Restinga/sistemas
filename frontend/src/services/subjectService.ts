import api from "../../config/apiConfig"

export interface SubjectPreRequisitInterface {
    id: string
    name: string
    code: string
}

export interface SubjectInterface {
    id?: string
    name: string
    objective: string
    menu: string
    code: string
    subject_teach_workload: string | number
    subject_ext_workload: string | number
    subject_remote_workload: string | number
    weekly_periods: string | number
    pre_requisits: Array<SubjectPreRequisitInterface | string>
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