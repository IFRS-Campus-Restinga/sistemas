import styles from './Base.module.css'
import CustomHeader from '../customHeader/CustomHeader'
import type React from 'react'

interface BaseProps {
    children: React.ReactNode
    navBar: React.ReactNode
}

const Base = ({ children, navBar }: BaseProps) => {

    return (
        <>
            <CustomHeader navBar={navBar}/>
            <main className={styles.main}>
                {children}
            </main>
        </>
    )
}

export default Base