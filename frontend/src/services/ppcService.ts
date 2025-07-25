import api from "../../config/apiConfig"

interface PPCSubjectInterface {
    subject_name: string
    subject_teach_workload: string 
    subject_ext_workload: string
    subject_remote_workload: string
    real_teach_workload: string
    real_ext_workload: string
    real_remote_workload: string
    total_workload: string
    weekly_periods: string
}

interface PPCCourseInterface {
    id: string
    name: string
}

export interface PPCInterface {
    id?: string
    title: string
    course: PPCCourseInterface
    subjects: PPCSubjectInterface[]
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
    }
}

export default PPCService