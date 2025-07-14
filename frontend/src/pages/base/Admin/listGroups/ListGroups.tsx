import GroupService from '../../../../services/groupService'
import ListPage from '../../../../components/listPage/ListPage'

const ListGroups = () => {

    const fetchGroups = async (currentPage: number, searchParam: string) => {
        const res = await GroupService.list(currentPage, searchParam)

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    return (
        <ListPage
            title='Grupos'
            fetchData={fetchGroups}
            registerUrl='/session/admin/grupos/create/'
        />
    )
}

export default ListGroups