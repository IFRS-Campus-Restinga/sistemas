import { Outlet } from "react-router-dom"
import Base from "../../../components/base/Base"
import styles from './BaseAdmin.module.css'


const BaseAdmin = () => {

    return (
        <Base>
            <nav className={styles.nav}>

            </nav>
            <Outlet />
        </Base>
    )
}

export default BaseAdmin