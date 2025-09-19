import ListPage from '../../../../features/listPage/ListPage'
import PPCService from '../../../../services/ppcService'

const translations = {
    "id": "id",
    "title": "título",
    "course": "curso",
    "created_at": "data de criação"
}

const PPCList = () => {
    const fetchPPCs = async (page: number = 1, searchParam: string) => {
        const res = await PPCService.list(page, searchParam, 'id, title, course.name, created_at')

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    return (
        <ListPage
            title={'Projeto Pedag. de Curso (PPC)'}
            fetchData={fetchPPCs}
            registerUrl='/session/admin/ppcs/create/'
            canEdit={true}
            canView={false}
            translations={translations}
        />
    )
}

export default PPCList
