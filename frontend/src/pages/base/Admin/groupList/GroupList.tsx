import GroupService from '../../../../services/groupService'
import ListPage from '../../../../features/listPage/ListPage'

const GroupList = () => {

    const fetchGroups = async (currentPage: number, searchParam: string) => {
        const res = await GroupService.list(currentPage, searchParam)

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const deleteGroup = async (groupId: string) => {

    }

    return (
        <ListPage
            title='Grupos'
            fetchData={fetchGroups}
            registerUrl='/session/admin/grupos/create/'
            canEdit={true}
            canView={true}
            onDelete={deleteGroup}
        />
    )
}

export default GroupList