import { Outlet, useNavigate } from "react-router-dom"
import Base from "../../../components/base/Base"
import { useEffect, useState } from "react"
import { useSetUser, useUser } from "../../../store/userHooks"
import { hasGroup } from "../../../utils/hasGroup"
import CustomLoading from "../../../components/customLoading/CustomLoading"
import UserService from "../../../services/userService"
import { AxiosError } from "axios"
import { toast } from "react-toastify"

const BaseUser = () => {
    const redirect = useNavigate()
    const user = useUser()
    const setUser = useSetUser()
    const [authorized, setAuthorized] = useState<boolean | undefined>()

    const fetchUserData = async () => {
        try {
            const res = await UserService.getData()

            setUser(res.data)
            
            if (res.data.first_login) redirect('/session/user/first-login/')

            setAuthorized(hasGroup('user', res.data))
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error?.response?.status === 401) {
                    toast.error("Token inválido ou refresh falhou, redirecionando...")
                    redirect('/session')
                } else {
                    console.error(error)
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
                if (group === 'user') redirect('/user/home/')
                if (group === 'admin') redirect('/admin/home/')
            }
        }
    }

    return (
        <Base navBar={<></>}>
            <Outlet />
        </Base>
    )
}

export default BaseUser