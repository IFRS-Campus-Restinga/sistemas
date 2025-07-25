import { useLocation } from 'react-router-dom'
import CourseService from '../../../../services/courseService'
import ListPage from '../../../../features/listPage/ListPage'

const CourseList = () => {
    const location = useLocation()

    const fetchCourses = async (page: number = 1, searchParam: string) => {
        const res = await CourseService.list(page, searchParam)

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const deleteCourse = async (courseId: string) => {

    }

    return (
        <ListPage
            title={'Cursos'}
            fetchData={fetchCourses}
            registerUrl='/session/admin/cursos/create/'
            onDelete={deleteCourse}
            canEdit={true}
            canView={true}
        />
    )
}

export default CourseList
