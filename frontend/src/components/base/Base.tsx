import styles from './Base.module.css'
import CustomHeader from '../customHeader/CustomHeader'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"
import BackButton from '../backButton/BackButton'

interface BaseProps {
    children: React.ReactNode
    navBar: React.ReactNode
}

const HOME_PATHS = [
    '/session/admin/home',
    '/session/admin/home/',
    '/session/user/home',
    '/session/user/home/',
    '/session/',
    '/session',
    '/',
]

const HISTORY_KEY = 'navHistory'
const CURRENT_KEY = 'navCurrent'
const MAX_HISTORY = 5

const getHistory = (): string[] => {
    try {
        return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]')
    } catch {
        return []
    }
}

const getHomePath = (pathname: string): string => {
    if (pathname.includes('/admin/')) return '/session/admin/home/'
    if (pathname.includes('/user/')) return '/session/user/home/'
    return '/'
}

const buildHistory = (prev: string, current: string, history: string[]): string[] => {
    if (history[0] === prev) return history

    const homePath = getHomePath(current)
    const withoutHome = history.filter(p => p !== homePath)
    const stack = [prev, ...withoutHome].slice(0, MAX_HISTORY - 1)

    if (stack[stack.length - 1] !== homePath) stack.push(homePath)

    return stack
}

const Base = ({ children, navBar }: BaseProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const prevPath = useRef<string | null>(sessionStorage.getItem(CURRENT_KEY))
    const isGoingBack = useRef(false)

    useEffect(() => {
        const current = location.pathname

        if (isGoingBack.current) {
            isGoingBack.current = false
            sessionStorage.setItem(CURRENT_KEY, current)
            prevPath.current = current
            return
        }

        const prev = prevPath.current
        if (prev && prev !== current) {
            const history = getHistory()
            sessionStorage.setItem(HISTORY_KEY, JSON.stringify(buildHistory(prev, current, history)))
        }

        sessionStorage.setItem(CURRENT_KEY, current)
        prevPath.current = current
    }, [location.pathname])

    const handleBack = () => {
        const history = getHistory()
        if (history.length === 0) return
        const [prev, ...rest] = history
        isGoingBack.current = true
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(rest))
        navigate(prev)
    }

    const isHome = HOME_PATHS.includes(location.pathname)
    const hasHistory = getHistory().length > 0

    return (
        <>
            <CustomHeader navBar={navBar}/>
            {!isHome && hasHistory && <BackButton onClick={handleBack} />}
            <main className={styles.main}>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
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
