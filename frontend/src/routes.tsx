import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/login/Login'
import BaseAdmin from './pages/base/Admin/BaseAdmin'
import BaseMember from './pages/base/Member/BaseMember'
import BaseVisitor from './pages/base/Visitor/BaseVisitor'
import HomeAdmin from './pages/base/Admin/home/HomeAdmin'
import HomeMember from './pages/base/Member/home/HomeMember'
import HomeVisitor from './pages/base/Visitor/home/HomeVisitor'
import CreateSystem from './pages/base/Admin/createSystem/CreateSystem'
import ListUsers from './pages/base/Admin/listUsers/ListUsers'
import ListGroups from './pages/base/Admin/listGroups/ListGroups'
import GroupForm from './pages/base/Admin/GroupForm/GroupForm'

const routes = createBrowserRouter([
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/session/admin/',
        element: <BaseAdmin />,
        children: [
            {
                path: 'home',
                element: <HomeAdmin />
            },
            {
                path: 'aluno/list',
                element: <ListUsers />
            },
            {
                path: 'servidor/list',
                element: <ListUsers />
            },
            {
                path: 'convidado/list',
                element: <ListUsers />
            },
            {
                path: 'grupos/create/',
                element: <GroupForm/>
            },
            {
                path: 'grupos/',
                element: <ListGroups/>
            },
            {
                path: 'grupos/:grupoId/edit/',
                element: <GroupForm/>
            },
            {
                path: 'sistemas/cadastro',
                element: <CreateSystem />
            }
        ]
    },
    {
        path: '/auth/membro',
        element: <BaseMember />,
        children: [
            {
                path: 'home',
                element: <HomeMember />
            }
        ]
    },
    {
        path: '/auth/visitante',
        element: <BaseVisitor />,
        children: [
            {
                path: 'home',
                element: <HomeVisitor />
            }
        ]
    }
])

export default routes