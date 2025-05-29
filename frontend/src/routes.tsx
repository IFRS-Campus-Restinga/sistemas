import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/login/Login'
import BaseAdmin from './pages/base/Admin/BaseAdmin'
import BaseMember from './pages/base/Member/BaseMember'
import BaseVisitor from './pages/base/Visitor/BaseVisitor'
import HomeAdmin from './pages/base/Admin/home/HomeAdmin'
import HomeMember from './pages/base/Member/home/HomeMember'
import HomeVisitor from './pages/base/Visitor/home/HomeVisitor'
import NewSystem from './pages/base/Admin/newSystem/NewSystem'

const routes = createBrowserRouter([
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/admin',
        element: <BaseAdmin />,
        children: [
            {
                path: '/admin/home',
                element: <HomeAdmin />
            },
            {
                path: '/admin/sistemas/cadastro',
                element: <NewSystem />
            }
        ]
    },
    {
        path: '/membro',
        element: <BaseMember />,
        children: [
            {
                path: '/membro/home',
                element: <HomeMember />
            }
        ]
    },
    {
        path: '/visitante',
        element: <BaseVisitor />,
        children: [
            {
                path: '/visitante/home',
                element: <HomeVisitor />
            }
        ]
    }
])

export default routes