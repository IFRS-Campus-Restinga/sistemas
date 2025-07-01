import { useLocation } from 'react-router-dom'
import UserService from '../../../../services/userService'
import ListPage from '../../../../components/listPage/ListPage'

const ListUsers = () => {
    const location = useLocation()
    const group = location.pathname.split('/')[3]

    const fetchUsers = async (page: number = 1, searchParam: string) => {
        const res = await UserService.searchOrListUsers(group, searchParam, page, 'list')

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    return (
        <ListPage
            title={group}
            fetchData={fetchUsers}
        />
    )
}

export default ListUsers
