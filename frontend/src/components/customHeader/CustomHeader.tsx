import styles from './CustomHeader.module.css'
import logoIFRSBranco from '../../assets/logo-ifrs-branco.png'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '../../pages/login/Login'
import { useEffect, useState } from 'react'
import gear from '../../assets/gear-svgrepo-com.svg'

interface UserData {
    first_name?: string
    last_name?: string
    profile_picture?: string
}

const CustomHeader = () => {
    const [user, setUser] = useState<UserData>()

    useEffect(() => {
        const token = sessionStorage.getItem('access')

        if (token) {
            setUser({
                first_name: jwtDecode<JwtPayload>(token).first_name,
                last_name: jwtDecode<JwtPayload>(token).last_name,
                profile_picture: jwtDecode<JwtPayload>(token).profile_picture_src
            })
        }
    }, [])

    return (
        <header className={styles.header}>
            <img src={logoIFRSBranco} alt="ifrs" className={styles.logo} />
            {
                user ? (
                    <div className={styles.userMenu}>
                        <span className={styles.greetings}>
                            Bem vindo,
                            <p className={styles.username}>
                                {user.first_name} {user.last_name}
                            </p>
                        </span>
                        {
                            user.profile_picture ? (
                                <img src={user.profile_picture} alt="foto_de_perfil" className={styles.accountOptions} />
                            ) : user.first_name ? (
                                <div className={styles.accountOptions}>{user.first_name[0]}</div>
                            ) : (
                                <img src={gear} className={styles.accountOptions} />
                            )
                        }
                    </div>
                ) : null
            }
        </header>
    )
}

export default CustomHeader