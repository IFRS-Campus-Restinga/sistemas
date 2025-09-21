import { Link } from 'react-router-dom'
import Menu from '../../../../components/menu/Menu'
import styles from './HomeUser.module.css'
import calendarIcon from '../../../../assets/calendar-svgrepo-com-white-2.svg'
import planIcon from '../../../../assets/plan-svgrepo-com-white.svg'
import booksIcon from '../../../../assets/books-overlapping-arrangement-svgrepo-com-white.svg'
import classIcon from '../../../../assets/classroom-svgrepo-com-white.svg'

const HomeUser = () => {

    return (
        <section className={styles.home}>
            <Menu/>
            <div className={styles.academicMenu}>
                <Link to={'/session/user/calendarios'} className={styles.menuButton}>
                    <img src={calendarIcon} alt="ver calendários" className={styles.menuIcon}/>
                    Calendários
                </Link>
                <Link to={'/session/user/cursos'} className={styles.menuButton}>
                    <img src={classIcon} alt="ver cursos" className={styles.menuIcon}/>
                    Cursos
                </Link>
                <Link to={'/session/user/disciplinas'} className={styles.menuButton}>
                    <img src={booksIcon} alt="ver disciplinas" className={styles.menuIcon}/>
                    Disciplinas
                </Link>
                <Link to={'/session/user/ppcs'} className={styles.menuButton}>
                    <img src={planIcon} alt="ver ppcs" className={styles.menuIcon}/>
                    Proj. Pedag. Curso
                </Link>
            </div>
        </section>
    )
}

export default HomeUser