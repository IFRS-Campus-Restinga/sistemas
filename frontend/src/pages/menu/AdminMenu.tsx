import MenuButton from '../../components/menuButton/MenuButton'
import calendarIcon from '../../assets/calendar-svgrepo-com-white-2.svg'
import planIcon from '../../assets/plan-svgrepo-com-white.svg'
import booksIcon from '../../assets/books-overlapping-arrangement-svgrepo-com-white.svg'
import classIcon from '../../assets/classroom-svgrepo-com-white.svg'
import graduateIcon from '../../assets/user-graduate-svgrepo-com-white.svg'
import suitIcon from '../../assets/user-suit-svgrepo-com-white.svg'
import guestIcon from '../../assets/user-svgrepo-com-white.svg'
import groupsIcon from '../../assets/user-lock-svgrepo-com-white.svg'
import { useUser } from '../../store/userHooks'
import styles from './AdminMenu.module.css'

const AdminMenu = () => {
    const { permissions } = useUser()
    const canView = (permission: string) => {
        return permissions.includes(permission)
    }

    return (
        <div className={styles.menu}>
            {canView('view_user') && (
                <>
                    <MenuButton
                        to="/session/alunos"
                        icon={graduateIcon}
                        label="Alunos"
                        alt="alunos"
                    />
                    <MenuButton
                        to="/session/servidores"
                        icon={suitIcon}
                        label="Servidores"
                        alt="servidores"
                    />
                    <MenuButton
                        to="/session/convidados"
                        icon={guestIcon}
                        label="Convidados"
                        alt="convidados"
                    />
                </>
            )}
            {canView('view_group') && (
                <MenuButton
                    to="/session/grupos"
                    icon={groupsIcon}
                    label="Grupos"
                    alt="grupos"
                />
            )}
            {canView('view_calendar') && (
                <MenuButton
                    to="/session/calendarios"
                    icon={calendarIcon}
                    label="Calendários"
                    alt="calendários"
                    iconScale={0.78}
                />
            )}
            {canView('view_course') && (
                <MenuButton
                    to="/session/cursos"
                    icon={classIcon}
                    label="Cursos"
                    alt="cursos"
                    iconScale={0.78}
                />
            )}
            {canView('view_subject') && (
                <MenuButton
                    to="/session/disciplinas"
                    icon={booksIcon}
                    label="Disciplinas"
                    alt="disciplinas"
                    iconScale={0.78}
                />
            )}
            {canView('view_ppc') && (
                <MenuButton
                    to="/session/ppcs"
                    icon={planIcon}
                    label="PPCs"
                    alt="PPCs"
                    iconScale={0.78}
                />
            )}
        </div>
    )
}

export default AdminMenu