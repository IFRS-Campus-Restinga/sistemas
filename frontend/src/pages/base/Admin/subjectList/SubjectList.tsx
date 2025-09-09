import ListPage from '../../../../features/listPage/ListPage'
import SubjectService from '../../../../services/subjectService'

const translations = {
    "id": "id",
    "name": "nome",
    "code": "código",
}

const SubjectList = () => {
    const fetchSubjects = async (page: number = 1, searchParam: string) => {
        const res = await SubjectService.list(page, searchParam, 'id, name, code')

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
            translations={translations}
        />
    )
}

export default SubjectList
