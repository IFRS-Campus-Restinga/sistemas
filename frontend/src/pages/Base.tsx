import { Outlet, useLocation, useMatches, useNavigate } from "react-router-dom"
import BaseLayout from "../components/base/Base"
import { useEffect, useState } from "react"
import { useSetBindRequestsCount, useSetUser, useUser } from "../store/userHooks"
import CustomLoading from "../components/customLoading/CustomLoading"
import UserService from "../services/userService"
import { AxiosError } from "axios"
import BindRequestService from "../services/bindRequestService"


const Base = () => {
    const redirect = useNavigate()
    const setUser = useSetUser()
    const setBindRequestsCount = useSetBindRequestsCount()
    const { permissions } = useUser()
    const location = useLocation()
    const matches = useMatches()
    const [authorized, setAuthorized] = useState<boolean | undefined>()

    const requiredPermissions = matches.flatMap((match) => {
        const handle = match.handle as { permissions?: string[] } | undefined
        return handle?.permissions ?? []
    })
    const hasPermissions = requiredPermissions.every((permission) => permissions.includes(permission))

    const fetchUserData = async () => {
        try {
            const res = await UserService.getData()

            setUser(res.data)
            try {
                const bindRequests = await BindRequestService.getRequestCount()
                setBindRequestsCount(bindRequests.data.count)
            } catch (error) {
                setBindRequestsCount(0)
                if (error instanceof AxiosError) {
                    console.error("Erro ao buscar solicitações de vínculo:", error)
                } else {
                    console.error(error)
                }
            }
            const hasPersonalInfos = res.data.personal_infos !== null && res.data.personal_infos !== undefined
            const hasAccountInfos = res.data.account_infos !== null && res.data.account_infos !== undefined
            const isPersonalAccount = res.data.is_abstract === false
            if (Boolean(res.data.first_login) && !hasPersonalInfos && !hasAccountInfos && isPersonalAccount && location.pathname !== '/session/first-login/') {
                redirect('/session/first-login/')
            }
            setAuthorized(Boolean(res.data.id))
        } catch (error) {
            if (error instanceof AxiosError) console.error("Erro inesperado ao buscar usuário:", error)
            redirect('/session/')
        }
    }

    useEffect(() => {
        if (location.pathname === '/session/' || location.pathname === '/session') return
        fetchUserData()
    }, [location.pathname])

    useEffect(() => {
        if (authorized && !hasPermissions && location.pathname !== '/session/home/' && location.pathname !== '/session/home') {
            redirect('/session/home/', { replace: true })
        }
    }, [authorized, hasPermissions, location.pathname, redirect])

    if (location.pathname === '/session/' || location.pathname === '/session') {
        return <Outlet />
    }

    if (authorized === undefined) {
        return (
            <BaseLayout navBar={<></>}>
                <div style={{margin: 'auto'}}>
                    <CustomLoading />
                </div>
            </BaseLayout>
        )
    }

    if (authorized === false || !hasPermissions) {
        return null
    }

    return (
        <BaseLayout navBar={<></>}>
            <Outlet />
        </BaseLayout>
    )
}

export default Base
