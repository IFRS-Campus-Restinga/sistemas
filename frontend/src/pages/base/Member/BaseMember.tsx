import { Outlet, useNavigate } from "react-router-dom"
import Base from "../../../components/base/Base"
import styles from './BaseMember.module.css'
import { useEffect, useState } from "react"
import { useSetUser, useUser } from "../../../store/userHooks"
import { hasGroup } from "../../../utils/hasGroup"
import CustomLoading from "../../../components/customLoading/CustomLoading"
import UserService from "../../../services/userService"
import { AxiosError } from "axios"


const BaseMember = () => {
    const redirect = useNavigate()
    const user = useUser()
    const setUser = useSetUser()
    const [authorized, setAuthorized] = useState<boolean | undefined>()

    const fetchUserData = async () => {
        try {
            const res = await UserService.getData()

            setUser(res.data)
            setAuthorized(hasGroup('membro', res.data))
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error?.response?.status === 401) {
                    console.error("Token inválido ou refresh falhou, redirecionando.")
                    redirect('/')
                } else {
                    console.error("Erro inesperado ao buscar usuário:", error)
                }
            }
        }
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    if (authorized === undefined) {
        return (
            <Base navBar={<></>}>
                <div style={{margin: 'auto'}}>
                    <CustomLoading />
                </div>
            </Base>
        )
    }

    if (authorized === false) {
        if (Object.values(user).every((value) => value !== null)) {
            for (let group in user.groups) {
                if (group === 'membro') redirect('/membro/home/')
                if (group === 'visit') redirect('/visit/home/')
            }
        }
    }

    return (
        <Base navBar={<></>}>
            <Outlet />
        </Base>
    )
}

export default BaseMember