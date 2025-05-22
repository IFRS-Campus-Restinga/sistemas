import { Outlet } from "react-router-dom"
import Base from "../../../components/base/Base"
import styles from './BaseMember.module.css'


const BaseMember = () => {

    return (
        <Base>
            <nav className={styles.nav}>

            </nav>
            <Outlet />
        </Base>
    )
}

export default BaseMember