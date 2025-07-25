import api from "../../config/apiConfig"

export interface ClassInterface {
    id?: string
    number: string
}

export interface CourseInterface {
    id?: string
    name: string
    category: string
    workload: string
    coord: string
    classes: ClassInterface[]
}

const CourseService = {
    create: async (params: CourseInterface) => {
        return api.post('api/academic/courses/create/', params)
    },

    list: async (page: number, search: string) => {
        return await api.get('api/academic/courses/get/', {
            params: {
                search,
                page,
                data_format: 'list'
            }
        })
    },

    get: async (courseId: string) => {
        return await api.get(`api/academic/courses/get/${courseId}/`, {
            params: {
                data_format: 'details'
            }
        });
    },

    edit: async (courseId: string, params: CourseInterface) => {
        return await api.put(`api/academic/courses/edit/${courseId}/`, params)
    }
}

export default CourseService