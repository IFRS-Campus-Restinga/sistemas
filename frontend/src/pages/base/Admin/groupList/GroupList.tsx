import GroupService from '../../../../services/groupService'
import ListPage from '../../../../features/listPage/ListPage'

const translations = {
    "id": "id",
    "name": "nome",
}

const GroupList = () => {

    const fetchGroups = async (currentPage: number, searchParam: string) => {
        const res = await GroupService.list(currentPage, searchParam, 'id, name')

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
            translations={translations}
        />
    )
}

export default GroupList