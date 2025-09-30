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
        const profileMap: Record<string, string> = {
            'servidores': 'servidor',
            'convidados': 'convidado',
            'alunos': 'aluno'
        };

        const profileKey = profileMap[accessProfile];

        if (!profileKey) {
            // Retorna um objeto "vazio" compatível com ListPage
            return {
                next: null,
                previous: null,
                data: []
            };
        }

        const res = await UserService.listByAccessProfile(
            profileKey,
            searchParam,
            page,
            'id, username, email, status, date_joined'
        );

        return {
            next: res.data.next ?? null,
            previous: res.data.previous ?? null,
            data: res.data.results ?? []
        };
    };

    return (
        <ListPage
            title={accessProfile}
            fetchData={fetchUsers}
            canEdit={true}
            canView={false}
            translations={translations}
        />
    )
}

export default UserList
