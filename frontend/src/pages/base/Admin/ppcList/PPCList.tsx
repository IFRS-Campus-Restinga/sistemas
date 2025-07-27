import ListPage from '../../../../features/listPage/ListPage'
import PPCService from '../../../../services/ppcService'

const PPCList = () => {
    const fetchPPCs = async (page: number = 1, searchParam: string) => {
        const res = await PPCService.list(page, searchParam)

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const deletePPC = async (ppcId: string) => {

    }

    return (
        <ListPage
            title={'Projeto Pedag. de Curso (PPC)'}
            fetchData={fetchPPCs}
            registerUrl='/session/admin/ppcs/create/'
            onDelete={deletePPC}
            canEdit={true}
            canView={true}
        />
    )
}

export default PPCList
