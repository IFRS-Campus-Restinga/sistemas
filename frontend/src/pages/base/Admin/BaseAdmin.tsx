import { Outlet, useNavigate } from "react-router-dom"
import Base from "../../../components/base/Base"
import CustomNavBar from "../../../components/customNavBar/CustomNavBar"
import userIcon from '../../../assets/user-svgrepo-com-white.svg'
import calendar from '../../../assets/calendar-svgrepo-com-white.svg'
import books from '../../../assets/books-fill-svgrepo-com-white.svg'
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
                                    link: '/admin/aluno/list',
                                },
                                {
                                    title: 'Servidores',
                                    link: '/admin/servidor/list',
                                },
                                {
                                    title: 'Convidados',
                                    link: '/admin/convidado/list',
                                },
                                {
                                    title: 'Grupos',
                                    link: '/admin/grupos',
                                },
                                {
                                    title: 'Permissões',
                                    link: '/admin/permissoes'
                                }
                            ]
                        },
                        {
                            dropdownTitle: 'Calendário', dropdownIcon: calendar, items: []
                        },
                        {
                            dropdownTitle: 'Gerenciamento Acadêmico', dropdownIcon: books, items: [
                                {
                                    link: '/admin/cursos',
                                    title: 'Cursos'
                                },
                                {
                                    link: '/admin/disciplinas',
                                    title: 'Disciplinas'
                                },
                                {
                                    link: '/admin/ppcs',
                                    title: "Proj. Pedag. Curso (PPC)"
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