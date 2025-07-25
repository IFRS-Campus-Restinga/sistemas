import api from "../../config/apiConfig"

const CourseClassService = {
    delete: async (classId: string) => {
        return api.delete(`api/academic/courses/classes/delete/${classId}/`)
    }
}

export default CourseClassService