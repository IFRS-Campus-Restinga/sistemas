import { useLocation } from 'react-router-dom'
import UserService from '../../../../services/userService'
import ListPage from '../../../../features/listPage/ListPage'

const translations = {
    "id": "id",
    "username": "nome",
    "email": "email",
    "status": "status",
    "date_joined": "data de entrada"
}

const UserList = () => {
    const location = useLocation()
    const accessProfile = location.pathname.split('/')[3]

    const fetchUsers = async (page: number = 1, searchParam: string) => {
        const res = await UserService.listByAccessProfile(accessProfile, searchParam, page, 'id, username, email, status, date_joined')

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const deleteUser = async (userId: string) => {

    }

    return (
        <ListPage
            title={accessProfile}
            fetchData={fetchUsers}
            registerUrl='/session/admin/usuarios/create/'
            onDelete={deleteUser}
            canEdit={true}
            canView={true}
            translations={translations}
        />
    )
}

export default UserList
