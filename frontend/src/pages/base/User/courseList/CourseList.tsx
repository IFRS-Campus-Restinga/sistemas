import CourseService from '../../../../services/courseService'
import ListPage from '../../../../features/listPage/ListPage'

const translations = {
    "id": "id",
    "name": "nome",
    "workload": "carga-horária",
    "category": "categoria"
}

const CourseList = () => {
    const fetchCourses = async (page: number = 1, searchParam: string) => {
        const res = await CourseService.list(page, searchParam, 'id, name, category, workload')

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    return (
        <ListPage
            title={'Cursos'}
            fetchData={fetchCourses}
            canEdit={false}
            canView={true}
            translations={translations}
        />
    )
}

export default CourseList
