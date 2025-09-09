import api from "../../config/apiConfig"
import flattenValues from "../utils/flattenObj"

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

    list: async (page: number, search: string, fields: string) => {
        fields = fields.trim()
        let res = await api.get('api/academic/ppcs/get/', {
            params: {
                search,
                page,
                fields
            }
        })

        res.data = flattenValues(res.data)
        
        return res
    },

    get: async (PPCId: string, fields: string) => {
        fields = fields
        .split(",")
        .map(f => f.trim())
        .filter(f => f)
        .join(",");

        return await api.get(`api/academic/ppcs/get/${PPCId}/`, {
            params: {
                fields
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