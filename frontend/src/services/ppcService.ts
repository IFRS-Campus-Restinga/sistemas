import api from "../../config/apiConfig"

export interface PreRequisitInterface {
    id: string
    ppcsubject?: string
}

export interface PPCSubjectInterface {
    id?: string
    subject: string
    subject_teach_workload: string
    subject_ext_workload: string
    subject_remote_workload: string
    weekly_periods: string
    pre_requisits: PreRequisitInterface[]
}

export interface PPCInterface {
    id?: string
    title: string
    course: string
    periods: SchoolPeriodInterface[]
}

export interface SchoolPeriodInterface {
    number: number
    curriculum: PPCSubjectInterface[]
}

const PPCService = {
    create: async (params: PPCInterface) => {
        return api.post('api/academic/ppcs/create/', params)
    },

    list: async (page: number, search: string) => {
        return await api.get('api/academic/ppcs/get/', {
            params: {
                search,
                page,
                data_format: 'list'
            }
        })
    },

    get: async (PPCId: string) => {
        return await api.get(`api/academic/ppcs/get/${PPCId}/`, {
            params: {
                data_format: 'details'
            }
        });
    },

    edit: async (PPCId: string, params: PPCInterface) => {
        return await api.put(`api/academic/ppcs/edit/${PPCId}/`, params)
    },

    deleteSubject: async (PPCId: string, subjectId: string) => {
        return await api.delete(`api/academic/ppcs/delete/${PPCId}/subjects/${subjectId}/`)
    },

    deletePreReq: async (PPCId: string, subjectId: string, preReqId: string) => {
        return await api.delete(`api/academic/ppcs/delete/${PPCId}/subjects/${subjectId}/pre_reqs/${preReqId}/`)
    }
}

export default PPCService