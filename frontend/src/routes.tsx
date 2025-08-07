import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/login/Login'
import BaseAdmin from './pages/base/Admin/BaseAdmin'
import BaseMember from './pages/base/Member/BaseMember'
import BaseVisitor from './pages/base/Visitor/BaseVisitor'
import HomeAdmin from './pages/base/Admin/home/HomeAdmin'
import HomeMember from './pages/base/Member/home/HomeMember'
import HomeVisitor from './pages/base/Visitor/home/HomeVisitor'
import SystemForm from './pages/base/Admin/systemForm/SystemForm'
import UserList from './pages/base/Admin/userList/UserList'
import GroupList from './pages/base/Admin/groupList/GroupList'
import GroupForm from './pages/base/Admin/groupForm/GroupForm'
import CalendarList from './pages/base/Admin/calendarList/CalendarList'
import CalendarForm from './pages/base/Admin/calendarForm/CalendarForm'
import Calendar from './pages/base/Admin/calendar/Calendar'
import EventForm from './pages/base/Admin/eventForm/EventForm'
import CourseList from './pages/base/Admin/courseList/CourseList'
import CourseForm from './pages/base/Admin/couseForm/CourseForm'
import SubjectList from './pages/base/Admin/subjectList/SubjectList'
import SubjectForm from './pages/base/Admin/subjectForm/SubjectForm'
import PPCList from './pages/base/Admin/ppcList/PPCList'
import PPCForm from './pages/base/Admin/ppcForm/PPCForm'

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
                element: <SystemForm />
            },
            {
                path: 'sistemas/:systemId/edit/',
                element: <SystemForm/>
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
            },
            {
                path: 'calendarios/:calendarId/eventos/create/',
                element: <EventForm/>
            },
            {
                path: 'calendarios/:calendarId/eventos/:eventId/edit/',
                element: <EventForm/>
            },
            {
                path: 'cursos/',
                element: <CourseList/>
            },
            {
                path: 'cursos/create/',
                element: <CourseForm/>
            },
            {
                path: 'cursos/:cursoId/edit/',
                element: <CourseForm/>
            },
            {
                path: 'disciplinas/',
                element: <SubjectList/>
            },
            {
                path: 'disciplinas/create/',
                element: <SubjectForm/>,
            },
            {
                path: 'disciplinas/:disciplinaId/edit/',
                element: <SubjectForm/>
            },
            {
                path: 'ppcs/',
                element: <PPCList/>
            },
            {
                path: 'ppcs/create/',
                element: <PPCForm/>
            },
            {
                path: 'ppcs/:ppcId/edit/',
                element: <PPCForm/>
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