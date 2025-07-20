import { Link } from 'react-router-dom';
import styles from './Menu.module.css'
import { SystemService } from '../../services/systemService';
import { useEffect, useState } from 'react';
import { useUser } from '../../store/userHooks';
import CustomButton from '../../components/customButton/CustomButton';
import CustomLoading from '../../components/customLoading/CustomLoading';
import doubleArrow from '../../assets/double-arrow-right-svgrepo-com-white.svg'

interface SystemInterface {
    id: string
    name: string
    system_url: string
    current_state:  string
    is_active: boolean
    groups: string[]
    dev_team: string[]
}

const Menu = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [systems, setSystems] = useState<SystemInterface[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [next, setNext] = useState<number | null>(null)
    const [prev, setPrev] = useState<number | null>(null)
    const user = useUser()

    const redirectToSystem = (system: SystemInterface) => {
        const url = `${system.system_url}/session/token/?system=${system.id}&user=${user.id}&profilePicture=${sessionStorage.getItem('profilePicture')}`;

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
        <>
            <h2 className={styles.h2}>Sistemas</h2>
            <Link to={'/session/admin/sistemas/cadastro'} className={styles.addButton}>+</Link>
            <section className={styles.menu}>
                {
                    prev ? (
                        <button className={styles.nextButton}>
                            <img src={doubleArrow} alt="página anterior" className={styles.icon}/>
                        </button>
                    ) : null
                }
                <div className={styles.menuContainer}>
                    {
                        systems.map((system) => (
                            <CustomButton text={system.name} type='button' onClick={() => redirectToSystem(system)}/>
                        ))
                    }
                </div>
                {
                    next ? (
                        <button className={styles.nextButton}>
                            <img src={doubleArrow} alt="próxima página" className={styles.icon}/>
                        </button>
                    ) : null
                }
            </section>
        </>
    )
}

export default Menu