import { Outlet, useNavigate } from "react-router-dom"
import Base from "../../../components/base/Base"
import CustomNavBar from "../../../components/customNavBar/CustomNavBar"
import userIcon from '../../../assets/user-svgrepo-com-white.svg'
import calendar from '../../../assets/calendar-svgrepo-com-white.svg'
import books from '../../../assets/books-fill-svgrepo-com-white.svg'
import home from '../../../assets/home-svgrepo-com-white.svg'
import { useEffect, useState } from "react"
import { useSetUser, useUser } from "../../../store/userHooks"
import { hasGroup } from "../../../utils/hasGroup"
import CustomLoading from "../../../components/customLoading/CustomLoading"
import UserService from "../../../services/userService"
import { AxiosError } from "axios"


const BaseAdmin = () => {
    const redirect = useNavigate()
    const user = useUser()
    const setUser = useSetUser()
    const [authorized, setAuthorized] = useState<boolean | undefined>()

    const fetchUserData = async () => {
        try {
            const res = await UserService.getData()

            setUser(res.data)
            setAuthorized(hasGroup('admin', res.data))
        } catch (error) {
            console.log(error instanceof AxiosError)
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
                if (group === 'aluno') redirect('/aluno/home/')
                if (group === 'visit') redirect('/visit/home/')
            }
        }
    }

    return (
        <Base navBar={
            <CustomNavBar
                navBarItems={
                    [
                        {
                            dropdownTitle: 'Usuários & Acesso', dropdownIcon: userIcon, items: [
                                {
                                    title: 'Alunos',
                                    link: '/session/admin/aluno',
                                },
                                {
                                    title: 'Servidores',
                                    link: '/session/admin/servidor',
                                },
                                {
                                    title: 'Convidados',
                                    link: '/session/admin/convidado',
                                },
                                {
                                    title: 'Grupos',
                                    link: '/session/admin/grupos',
                                },
                            ]
                        },
                        {
                            dropdownTitle: 'Gerenciamento Acadêmico', dropdownIcon: books, items: [
                                {
                                    title: 'Calendários',
                                    link: '/session/admin/calendarios'
                                },
                                {
                                    title: 'Cursos',
                                    link: '/session/admin/cursos',
                                },
                                {
                                    title: 'Disciplinas',
                                    link: '/session/admin/disciplinas',
                                },
                                {
                                    title: "Proj. Pedag. Curso (PPC)",
                                    link: '/session/admin/ppcs',
                                }
                            ]
                        }
                    ]
                }
            />
        }>
            <Outlet />
        </Base>
    )
}

export default BaseAdmin