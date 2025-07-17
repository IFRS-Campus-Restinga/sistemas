import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/login/Login'
import BaseAdmin from './pages/base/Admin/BaseAdmin'
import BaseMember from './pages/base/Member/BaseMember'
import BaseVisitor from './pages/base/Visitor/BaseVisitor'
import HomeAdmin from './pages/base/Admin/home/HomeAdmin'
import HomeMember from './pages/base/Member/home/HomeMember'
import HomeVisitor from './pages/base/Visitor/home/HomeVisitor'
import CreateSystem from './pages/base/Admin/createSystem/CreateSystem'
import UserList from './pages/base/Admin/userList/UserList'
import GroupList from './pages/base/Admin/groupList/GroupList'
import GroupForm from './pages/base/Admin/groupForm/GroupForm'
import CalendarList from './pages/base/Admin/calendarList/CalendarList'
import CalendarForm from './pages/base/Admin/calendarForm/CalendarForm'
import Calendar from './pages/base/Admin/calendar/Calendar'

const routes = createBrowserRouter([
    {
        path: 'session/',
        element: <Login />
    },
    {
        path: '/session/admin/',
        element: <BaseAdmin />,
        children: [
            {
                path: 'home/',
                element: <HomeAdmin />
            },
            {
                path: 'aluno/',
                element: <UserList />
            },
            {
                path: 'servidor/',
                element: <UserList />
            },
            {
                path: 'convidado/',
                element: <UserList />
            },
            {
                path: 'grupos/create/',
                element: <GroupForm/>
            },
            {
                path: 'grupos/',
                element: <GroupList/>
            },
            {
                path: 'grupos/:groupId/edit/',
                element: <GroupForm/>
            },
            {
                path: 'sistemas/cadastro/',
                element: <CreateSystem />
            },
            {
                path: 'calendarios/',
                element: <CalendarList/>
            },
            {
                path: 'calendarios/create/',
                element: <CalendarForm/>
            },
            {
                path: 'calendarios/:calendarId/',
                element: <Calendar/>
            },
            {
                path: 'calendarios/:calendarId/edit/',
                element: <CalendarForm/>
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