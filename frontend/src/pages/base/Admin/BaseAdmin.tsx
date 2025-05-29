import { Outlet } from "react-router-dom"
import Base from "../../../components/base/Base"
import CustomNavBar from "../../../components/customNavBar/CustomNavBar"
import user from '../../../assets/user-svgrepo-com-black.svg'


const BaseAdmin = () => {

    return (
        <Base>
            <CustomNavBar
                navBarItems={
                    [
                        {
                            dropdownTitle: 'Usuários & Permissões', dropdownIcon: user, items: [
                                {
                                    title: 'Alunos',
                                    link: '/admin/alunos',
                                },
                                {
                                    title: 'Servidores',
                                    link: '/admin/servidores',
                                },
                                {
                                    title: 'Convidados',
                                    link: '/admin/convidados',
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
                        }
                    ]
                }
            />
            <Outlet />
        </Base>
    )
}

export default BaseAdmin