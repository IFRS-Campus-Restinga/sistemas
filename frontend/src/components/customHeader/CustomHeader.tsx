import styles from './CustomHeader.module.css'
import logoIFRSBranco from '../../assets/logo-ifrs-branco.png'
import { useEffect, useState } from 'react'
import gear from '../../assets/gear-svgrepo-com.svg'
import Dropdown from '../dropdown/Dropdown'
import AuthService from '../../services/authService'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useClearUser, useUser } from '../../store/userHooks'
import { hasGroup } from '../../utils/hasGroup'
import { checkGroup } from '../../utils/checkGroup'

interface CustomHeaderProps {
    navBar: React.ReactNode
}

const CustomHeader = ({navBar}: CustomHeaderProps) => {
    const redirect = useNavigate()
    const user = useUser()
    const clearUser = useClearUser()
    const [profilePicture, setProfilePicture] = useState<string | null>()

    const logout = async () => {
        const req = AuthService.logout()

        toast.promise(
            (async () => {
                try {
                    await req;
                } finally {
                    sessionStorage.clear()
                    clearUser()
                    redirect('/session')
                }
            })(),
            {
                pending: 'Deconectando...',
                error: {
                    render({ data }: any) {
                        return data.message || 'Erro sair da conta'
                    }
                }
            }
        )
    }

    useEffect(() => {
        setProfilePicture(sessionStorage.getItem('profilePicture'))
    }, [user])

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <img src={logoIFRSBranco} alt="ifrs" className={styles.logo} onClick={() => redirect(`/session/${checkGroup(user.groups!)}/home/`)}/>
                {
                    !Object.values(user).every((value) => value === null) ? (
                        <div className={styles.userMenu}>
                            <span className={styles.greetings}>
                                Bem vindo,
                                <p className={styles.username}>
                                    {user.username}
                                </p>
                            </span>
                            {
                                profilePicture ? (
                                    <Dropdown
                                        dropdownChildren={<img src={profilePicture} alt="foto_de_perfil" className={styles.accountOptions} />}
                                        items={[
                                            {
                                                title: 'Logout',
                                                onClick: logout
                                            }
                                        ]}
                                    />
                                ) : user.username ? (
                                    <div className={styles.accountOptions}>{user.username[0]}</div>
                                ) : (
                                    <img src={gear} className={styles.accountOptions} />
                                )
                            }
                        </div>
                    ) : null
                }
            </div>
            {navBar}
        </header>
    )
}

export default CustomHeader