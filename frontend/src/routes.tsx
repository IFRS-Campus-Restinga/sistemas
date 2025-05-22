import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/login/Login'
import BaseAdmin from './pages/base/Admin/BaseAdmin'
import BaseMember from './pages/base/Member/BaseMember'
import BaseVisitor from './pages/base/Visitor/BaseVisitor'
import HomeAdmin from './pages/base/Admin/home/HomeAdmin'
import HomeMember from './pages/base/Member/home/HomeMember'
import HomeVisitor from './pages/base/Visitor/home/HomeVisitor'

const routes = createBrowserRouter([
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/Admin',
        element: <BaseAdmin />,
        children: [
            {
                path: '/Admin/home',
                element: <HomeAdmin />
            }
        ]
    },
    {
        path: '/Membro',
        element: <BaseMember />,
        children: [
            {
                path: '/Membro/home',
                element: <HomeMember />
            }
        ]
    },
    {
        path: '/Convidado',
        element: <BaseVisitor />,
        children: [
            {
                path: '/Convidado/home',
                element: <HomeVisitor />
            }
        ]
    }
])

export default routes