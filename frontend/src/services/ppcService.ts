import api from "../../config/apiConfig"

export interface PreRequisitInterface {
    subject: string
}

export interface CurriculumInterface {
    id?: string
    subject: string
    subject_teach_workload: string
    subject_ext_workload: string
    subject_remote_workload: string
    period: number
    weekly_periods: string
    pre_requisits: Array<PreRequisitInterface | string>
}

export interface PPCInterface {
    id?: string
    title: string
    course: string
    curriculum: CurriculumInterface[] | File
}

const PPCService = {
    create: async (params: PPCInterface) => {
        return api.post(
            'api/academic/ppcs/create/',
            params,
            {
                headers : {
                    "Content-Type": "multipart/form-data"
                }
            }
        )
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

    get: async (PPCId: string, data_format: string = 'view_details') => {
        return await api.get(`api/academic/ppcs/get/${PPCId}/`, {
            params: {
                data_format
            }
        });
    },

    edit: async (PPCId: string, params: PPCInterface) => {
        return await api.put(`api/academic/ppcs/edit/${PPCId}/`, params)
    },

    deletePeriod: async (PPCId: string, period: number) => {
        return await api.delete(`api/academic/ppcs/delete/${PPCId}/period/${period}/`)
    },

    deleteSubject: async (PPCId: string, subjectId: string) => {
        return await api.delete(`api/academic/ppcs/delete/${PPCId}/subjects/${subjectId}/`)
    },

    deletePreReq: async (PPCId: string, subjectId: string, preReqId: string) => {
        return await api.delete(`api/academic/ppcs/delete/${PPCId}/subjects/${subjectId}/pre_reqs/${preReqId}/`)
    },
}

export default PPCService