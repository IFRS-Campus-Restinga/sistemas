import { Link, useNavigate } from 'react-router-dom';
import styles from './HomeAdmin.module.css'
import { SystemService } from '../../../../services/systemService';
import { useEffect, useState } from 'react';
import { useUser } from '../../../../store/userHooks';
import CustomButton from '../../../../components/customButton/CustomButton';
import CustomLoading from '../../../../components/customLoading/CustomLoading';

interface SystemInterface {
    id: string
    name: string
    system_url: string
    current_state:  string
    is_active: boolean
    groups: string[]
    dev_team: string[]
}

const HomeAdmin = () => {
    const redirect = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [systems, setSystems] = useState<SystemInterface[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const user = useUser()

    const redirectToSystem = (system: SystemInterface) => {
        const url = `${system.system_url}/auth/token/?system=${system.id}&user=${user.id}&profilePicture=${sessionStorage.getItem('profilePicture')}`;

        window.open(url, '_blank')
    }

    const fetchSystems = async () => {
        try {
            const res = await SystemService.list(user.id!, currentPage)
            
            setSystems(res.data.results)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSystems()
    }, [])

    if (isLoading) return (
        <div style={{margin: 'auto'}}>
            <CustomLoading/>
        </div>
    )

    return (
        <section className={styles.section}>
            <h2 className={styles.h2}>Bem vindo ADM</h2>
            <Link to={'/session/admin/sistemas/cadastro'}>Adicionar novo sistema</Link>
            <div className={styles.menuContainer}>
                {
                    systems.map((system) => (
                        <CustomButton text={system.name} type='button' onClick={() => redirectToSystem(system)}/>
                    ))
                }
            </div>
        </section>
    )
}

export default HomeAdmin