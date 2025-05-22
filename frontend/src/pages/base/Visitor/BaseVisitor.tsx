import { Outlet } from "react-router-dom"
import Base from "../../../components/base/Base"
import styles from './BaseVisitor.module.css'


const BaseVisitor = () => {

    return (
        <Base>
            <nav className={styles.nav}>

            </nav>
            <Outlet />
        </Base>
    )
}

export default BaseVisitor