import { useNavigate } from 'react-router-dom'
import CustomButton from '../../components/customButton/CustomButton'
import { useSetUser, useUser } from '../../store/userHooks'
import styles from './ErrorBoundary.module.css'
import Base from '../../components/base/Base'
import { useEffect } from 'react'
import UserService from '../../services/userService'
import { AxiosError } from 'axios'

const ErrorBoundary = () => {
    const user = useUser()
    const setUser = useSetUser()
    const redirect = useNavigate()

    const handleRedirect = () => {
        if (user.groups?.includes("user")) redirect('/session/user/home')
        if (user.groups?.includes("admin")) redirect('/session/admin/home')
        else redirect('/session')
    }

    const fetchUserData = async () => {
        try {
            const res = await UserService.getData()

            setUser(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error?.response?.status === 401) {
                    console.error("Token inválido ou refresh falhou, redirecionando.")
                    redirect('/session')
                } else {
                    console.error("Erro inesperado ao buscar usuário:", error)
                }
            }
        }
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    return (
        <Base navBar={<></>}>
            <section className={styles.section}>
                <h2 className={styles.h2}>404</h2>
                <div className={styles.div}>Página não encontrada, clique no botão abaixo para retornar</div>
                <CustomButton text='Volta para o HUB' type='button' onClick={() => handleRedirect()}/>
            </section>    
        </Base>
    )
}

export default ErrorBoundary