import styles from './CustomHeader.module.css'
import logoIFRSBranco from '../../assets/logo-ifrs-branco.png'
import { useEffect, useState } from 'react'
import gear from '../../assets/gear-svgrepo-com.svg'
import Dropdown from '../dropdown/Dropdown'
import AuthService from '../../services/authService'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useClearUser, useUser } from '../../store/userHooks'
import CustomLoading from '../customLoading/CustomLoading'
import { AxiosError } from 'axios'
import NotificationBadge from '../notificationBadge/NotificationBadge'

interface CustomHeaderProps {
    navBar: React.ReactNode
}

const CustomHeader = ({navBar}: CustomHeaderProps) => {
    const redirect = useNavigate()
    const user = useUser()
    const clearUser = useClearUser()
    const [profilePicture, setProfilePicture] = useState<string | null>()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const bindRequestsCount = user.bind_requests_count ?? 0

    const logout = async () => {
        const logoutStartedAt = Date.now()
        setIsLoggingOut(true)

        try {
            await AuthService.logout()
            const remainingTime = 2000 - (Date.now() - logoutStartedAt)

            if (remainingTime > 0) {
                await new Promise((resolve) => setTimeout(resolve, remainingTime))
            }

            localStorage.removeItem('profilePicture')
            clearUser()
            window.location.replace('/session/')
        } catch (error) {
            setIsLoggingOut(false)
            const message = error instanceof AxiosError
                ? error.response?.data?.message
                : error instanceof Error ? error.message : null

            toast.error(message || 'Erro ao sair da conta')
        }
    }

    useEffect(() => {
        setProfilePicture(localStorage.getItem('profilePicture'))
    }, [user])

    if (isLoggingOut) {
        return (
            <div className={styles.logoutLoading} role="status" aria-live="polite">
                <CustomLoading color="#ffffff" />
                <p>Encerrando sessão...</p>
            </div>
        )
    }

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <img
                    src={logoIFRSBranco}
                    alt="ifrs"
                    className={styles.logo}
                    onClick={user.id ? () => redirect('/session/home/') : undefined}
                />
                {user.id ? (
                    <div className={styles.userMenu}>
                            <span className={styles.greetings}>
                                Bem vindo
                                <p className={styles.username}>
                                    {user.username}
                                </p>
                            </span>
                            {
                                profilePicture ? (
                                    <Dropdown
                                        dropdownChildren={
                                            <div className={styles.accountControl}>
                                                <img src={profilePicture} alt="foto_de_perfil" className={styles.accountOptions} />
                                                {bindRequestsCount > 0 ? (
                                                    <NotificationBadge count={bindRequestsCount} />
                                                ) : null}
                                            </div>
                                        }
                                        items={[
                                            ...(!user.is_abstract && !user.first_login ? [{
                                                title: "Minha conta",
                                                onClick: () => redirect('/session/profile/')
                                            }] : []),
                                            {
                                                title: 'Logout',
                                                onClick: logout
                                            }
                                        ]}
                                    />
                                ) : user.username ? (
                                    <Dropdown
                                        dropdownChildren={
                                            <div className={styles.accountControl}>
                                                <div className={styles.accountOptions}>{user.username[0].toUpperCase()}</div>
                                                {bindRequestsCount > 0 ? (
                                                    <NotificationBadge count={bindRequestsCount} />
                                                ) : null}
                                            </div>
                                        }
                                        items={[
                                            ...(!user.is_abstract && !user.first_login ? [{
                                                title: "Minha conta",
                                                onClick: () => redirect('/session/profile/')
                                            }] : []),
                                            {
                                                title: 'Logout',
                                                onClick: logout
                                            }
                                        ]}
                                    />
                                ) : (
                                    <img src={gear} className={styles.accountOptions} />
                                )
                            }
                    </div>
                ) : null}
            </div>
            {navBar}
        </header>
    )
}

export default CustomHeader
