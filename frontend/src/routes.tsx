import { createBrowserRouter } from 'react-router-dom'
// Base
import Login from './pages/login/Login'

// Admin
import Base from './pages/Base'
import AuthHome from './pages/authHome/AuthHome'
import SystemForm from './pages/systemForm/SystemForm'
import UserList from './pages/userList/UserList'
import GroupList from './pages/groupList/GroupList'
import GroupForm from './pages/groupForm/GroupForm'
import GroupDetails from './pages/groupDetails/GroupDetails'
import CalendarList from './pages/calendarList/CalendarList'
import CalendarForm from './pages/calendarForm/CalendarForm'
import Calendar from './pages/calendar/Calendar'
import EventForm from './pages/eventForm/EventForm'
import CourseList from './pages/courseList/CourseList'
import CourseForm from './pages/couseForm/CourseForm'
import SubjectList from './pages/subjectList/SubjectList'
import SubjectForm from './pages/subjectForm/SubjectForm'
import PPCList from './pages/ppcList/PPCList'
import PPCForm from './pages/ppcForm/PPCForm'
import UserForm from './pages/userForm/UserForm'
import UserDetails from './pages/userDetails/UserDetails'
import CourseDetailsAdmin from './pages/courseDetails/CourseDetails'
import EventDetailsAdmin from './pages/eventDetails/EventDetails'
import SubjectDetailsAdmin from './pages/subjectDetails/SubjectDetails'
import ProfileAdmin from './pages/profile/Profile'
import ProfileFormAdmin from './pages/profileForm/ProfileForm'

import PPCDetails from './features/ppcDetails/PPCDetails'
import ErrorBoundary from './pages/errorBoundary/ErrorBoundary'
import Home from './pages/home/Home'

const routes = createBrowserRouter([
    {
        path: '/',
        element: <Home/>
    },
    {
        path: '/session/',
        element: <Base />,
        children: [
            { 
                index: true, 
                element: <Login /> 
            },
            { 
                path: 'home/', 
                element: <AuthHome /> 
            },
            { 
                path: 'sistemas/cadastro/', 
                element: <SystemForm />, 
                handle: { permissions: ['add_system'] } 
            },
            { 
                path: 'sistemas/:systemId/edit/', 
                element: <SystemForm />, 
                handle: { permissions: ['change_system'] } 
            },
            { 
                path: 'alunos/', 
                element: <UserList />, 
                handle: { permissions: ['view_user'] }
            },
            { 
                path: 'servidores/', 
                element: <UserList />, 
                handle: { permissions: ['view_user'] }
            },
            { 
                path: 'convidados/', 
                element: <UserList />, 
                handle: { permissions: ['view_user'] }
            },
            { 
                path: 'grupos/', 
                element: <GroupList />, 
                handle: { permissions: ['view_group'] } 
            },
            { 
                path: 'grupos/create/', 
                element: <GroupForm />, 
                handle: { permissions: ['add_group'] } 
            },
            { 
                path: 'grupos/:groupId/', 
                element: <GroupDetails />, 
                handle: { permissions: ['view_group'] } 
            },
            { 
                path: 'grupos/:groupId/edit/', 
                element: <GroupForm />, 
                handle: { permissions: ['change_group'] } 
            },
            { 
                path: 'calendarios/', 
                element: <CalendarList />, 
                handle: { permissions: ['view_calendar'] } 
            },
            { 
                path: 'calendarios/create/', 
                element: <CalendarForm />, 
                handle: { permissions: ['add_calendar'] } 
            },
            { 
                path: 'calendarios/:calendarId/', 
                element: <Calendar />, 
                handle: { permissions: ['view_calendar'] } 
            },
            { 
                path: 'calendarios/:calendarId/edit/', 
                element: <CalendarForm />, 
                handle: { permissions: ['change_calendar'] } 
            },
            { 
                path: 'calendarios/:calendarId/eventos/create/', 
                element: <EventForm />, 
                handle: { permissions: ['add_event'] } 
            },
            { 
                path: 'calendarios/:calendarId/eventos/:eventId/edit/', 
                element: <EventForm />, 
                handle: { permissions: ['change_event'] } 
            },
            { 
                path: 'cursos/', 
                element: <CourseList />, 
                handle: { permissions: ['view_course', 'view_courseclass'] } 
            },
            { 
                path: 'cursos/create/', 
                element: <CourseForm />, 
                handle: { permissions: ['add_course', 'add_courseclass'] } 
            },
            { 
                path: 'cursos/:cursoId/edit/', 
                element: <CourseForm />, 
                handle: { permissions: ['change_course', 'change_courseclass'] } 
            },
            { 
                path: 'cursos/:cursoId/', 
                element: <CourseDetailsAdmin />, 
                handle: { permissions: ['view_course', 'view_courseclass'] } 
            },
            { 
                path: 'disciplinas/', 
                element: <SubjectList />, 
                handle: { permissions: ['view_subject'] } 
            },
            { 
                path: 'disciplinas/create/', 
                element: <SubjectForm />, 
                handle: { permissions: ['add_subject'] } 
            },
            { 
                path: 'disciplinas/:disciplinaId/edit/', 
                element: <SubjectForm />, 
                handle: { permissions: ['change_subject'] } 
            },
            { 
                path: 'disciplinas/:subjectId/', 
                element: <SubjectDetailsAdmin />, 
                handle: { permissions: ['view_subject'] } 
            },
            { 
                path: 'ppcs/', 
                element: <PPCList />, 
                handle: { permissions: ['view_ppc', 'view_subject', 'view_course'] } 
            },
            { 
                path: 'ppcs/:ppcId/', 
                element: <PPCDetails />, 
                handle: { permissions: ['view_ppc', 'view_subject', 'view_course'] } 
            },
            { 
                path: 'ppcs/create/', 
                element: <PPCForm />, 
                handle: { permissions: ['add_ppc'] } 
            },
            { 
                path: 'ppcs/:ppcId/edit/', 
                element: <PPCForm />, 
                handle: { permissions: ['change_ppc'] } 
            },
            { 
                path: 'alunos/:alunoId/edit/', 
                element: <UserForm />, 
                handle: { permissions: ['change_user'] }
            },
            { 
                path: 'alunos/:userId/', 
                element: <UserDetails />, 
                handle: { permissions: ['view_user'] }
            },
            { 
                path: 'servidores/:servidorId/edit/', 
                element: <UserForm />, 
                handle: { permissions: ['change_user'] }
            },
            { 
                path: 'servidores/:userId/', 
                element: <UserDetails />, 
                handle: { permissions: ['view_user'] }
            },
            { 
                path: 'convidados/:convidadoId/edit/', 
                element: <UserForm />, 
                handle: { permissions: ['change_user'] }
            },
            { 
                path: 'convidados/:userId/', 
                element: <UserDetails />, 
                handle: { permissions: ['view_user'] }
            },
            { 
                path: 'calendarios/:calendarId/eventos/:eventId/', 
                element: <EventDetailsAdmin />, 
                handle: { permissions: ['view_event'] } 
            },
            { 
                path: 'first-login', 
                element: <ProfileFormAdmin /> 
            },
            { 
                
                path: 'profile', 
                element: <ProfileAdmin /> 
            },
        ]
    },
    { path: '*', element: <ErrorBoundary/> }
])

export default routes
