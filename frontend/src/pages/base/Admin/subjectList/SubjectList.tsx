import ListPage from '../../../../features/listPage/ListPage'
import SubjectService from '../../../../services/subjectService'

const SubjectList = () => {
    const fetchSubjects = async (page: number = 1, searchParam: string) => {
        const res = await SubjectService.list(page, searchParam)

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const deleteSubject = async (subjectId: string) => {

    }

    return (
        <ListPage
            title={'Disciplinas'}
            fetchData={fetchSubjects}
            registerUrl='/session/admin/disciplinas/create/'
            onDelete={deleteSubject}
            canEdit={true}
            canView={true}
        />
    )
}

export default SubjectList
