import { createBrowserRouter } from 'react-router-dom'
// Base
import Login from './pages/login/Login'

// Admin
import BaseAdmin from './pages/base/Admin/BaseAdmin'
import HomeAdmin from './pages/base/Admin/home/HomeAdmin'
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
import UserForm from './pages/base/Admin/userForm/UserForm'

// User
import BaseUser from './pages/base/User/BaseUser'
import HomeUser from './pages/base/User/home/HomeUser'
import CalendarUser from './pages/base/User/calendar/Calendar'
import CalendarListUser from './pages/base/User/calendarList/CalendarList'
import CourseListUser from './pages/base/User/courseList/CourseList'
import PPCListUser from './pages/base/User/ppcList/PPCList'
import SubjectListUser from './pages/base/User/subjectList/SubjectList'
import CourseDetails from './pages/base/User/courseDetails/CourseDetails'
import EventDetails from './pages/base/User/eventDetails/EventDetails'
import ProfileForm from './pages/base/User/profileForm/ProfileForm'
import SubjectDetails from './pages/base/User/subjectDetails/SubjectDetails'
import PPCDetails from './features/ppcDetails/PPCDetails'
import Profile from './pages/base/User/profile/Profile'
import ErrorBoundary from './pages/errorBoundary/ErrorBoundary'
import Home from './pages/home/Home'

const routes = createBrowserRouter([
    {
        path: '/',
        element: <Home/>
    },
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
                path: 'alunos/',
                element: <UserList />
            },
            {
                path: 'servidores/',
                element: <UserList />
            },
            {
                path: 'convidados/',
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
                path: 'ppcs/:ppcId/',
                element: <PPCDetails/>
            },
            {
                path: 'ppcs/create/',
                element: <PPCForm/>
            },
            {
                path: 'ppcs/:ppcId/edit/',
                element: <PPCForm/>
            },
            {
                path: 'alunos/:alunoId/edit/',
                element: <UserForm/>
            },
            {
                path: 'servidores/:servidorId/edit/',
                element: <UserForm/>
            },
            {
                path: 'convidados/:convidadoId/edit/',
                element: <UserForm/>
            },
        ]
    },
    {
        path: '/session/user',
        element: <BaseUser />,
        children: [
            {
                path: 'home',
                element: <HomeUser />
            },
            {
                path: 'first-login',
                element: <ProfileForm/>
            },
            {
                path: 'calendarios/',
                element: <CalendarListUser/>
            },
            {
                path: 'calendarios/:calendarioId/',
                element: <CalendarUser/>
            },
            {
                path: 'calendarios/:calendarioId/eventos/:eventoId/',
                element: <EventDetails/>
            },
            {
                path: 'cursos/',
                element: <CourseListUser/>
            },
            {
                path: 'cursos/:cursoId/',
                element: <CourseDetails/>
            },
            {
                path: 'ppcs/',
                element: <PPCListUser/>
            },
            {
                path: 'ppcs/:ppcId/',
                element: <PPCDetails/>
            },
            {
                path: 'disciplinas/',
                element: <SubjectListUser/>,
            },
            {
                path: 'disciplinas/:subjectId/',
                element: <SubjectDetails/>
            },
            {
                path: 'profile',
                element: <Profile/>
            }
        ]
    },
    {
        path: '*',
        element: <ErrorBoundary/>
    }
])

export default routes