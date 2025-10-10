import styles from './Base.module.css'
import CustomHeader from '../customHeader/CustomHeader'
import type React from 'react'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

interface BaseProps {
    children: React.ReactNode
    navBar: React.ReactNode
}

const Base = ({ children, navBar }: BaseProps) => {

    return (
        <>
            <CustomHeader navBar={navBar}/>
            <main className={styles.main}>
                <ToastContainer 
                    position="bottom-right" 
                    autoClose={3000} 
                    newestOnTop 
                    closeOnClick 
                    pauseOnHover 
                />
                {children}
            </main>
        </>
    )
}

export default Base