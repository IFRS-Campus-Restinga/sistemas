import { Link, useNavigate } from 'react-router-dom';
import styles from './Menu.module.css'
import { SystemService } from '../../services/systemService';
import { useEffect, useState } from 'react';
import { useUser } from '../../store/userHooks';
import CustomLoading from '../../components/customLoading/CustomLoading';
import doubleArrow from '../../assets/double-arrow-right-svgrepo-com-white.svg'
import Actions from '../actions/Actions';
import dots from '../../assets/three-dots-line-svgrepo-com-white.svg'
import x from '../../assets/close-svgrepo-com-white-thick.svg'
import Modal from '../modal/Modal';
import FormContainer from '../formContainer/FormContainer';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

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
    const redirect = useNavigate()
    const [apiKey, setAPIKey] = useState<string | null>()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [systems, setSystems] = useState<SystemInterface[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [next, setNext] = useState<number | null>(null)
    const [prev, setPrev] = useState<number | null>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const user = useUser()

    const redirectToSystem = (system: SystemInterface) => {
        const url = `${system.system_url}/session/token/?system=${system.id}&user=${user.id}&profilePicture=${sessionStorage.getItem('profilePicture')}`;

        window.open(url, '_blank')
    }

    const fetchSystems = async () => {
        try {
            const res = await SystemService.list(user.id!, currentPage)
            
            setSystems(res.data.results)
            setNext(res.data.next ? currentPage + 1 : null)
            setPrev(res.data.next ? currentPage - 1 : null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAPIKey = async (systemId: string) => {
        try {
            const res = await SystemService.getAPIKey(systemId)

            setAPIKey(res.data)
            setIsOpen(true)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        }
    }

    const handleSystemDetails = (system: SystemInterface) => {
        if (!user.groups?.includes('admin')) {
            return system.dev_team.includes(user.id!) && system.current_state === 'Em desenvolvimento'
        }

        return true
    }

    useEffect(() => {
        fetchSystems()
    }, [currentPage])

    if (isLoading) return (
        <div style={{margin: 'auto'}}>
            <CustomLoading/>
        </div>
    )

    return (
        <>
            <h2 className={styles.h2}>Sistemas</h2>
            {
                user.groups?.includes('admin') ? (
                    <Link to={'/session/admin/sistemas/cadastro'} className={styles.addButton}>+</Link>
                ) : null
            }
            <section className={styles.menu}>
                {
                    prev ? (
                        <button className={styles.nextButton} onClick={() => setCurrentPage((prev) => prev - 1)}>
                            <img src={doubleArrow} alt="página anterior" className={styles.icon}/>
                        </button>
                    ) : null
                }
                <div className={styles.menuContainer}>
                    {
                        systems.map((system) => (
                            <>
                            <button className={styles.systemButton} style={{backgroundColor: system.is_active ? "006b3f" : "#ccc"}} onClick={() => redirectToSystem(system)}>
                                <p className={styles.systemTitle}>{system.name}</p>
                                {
                                    handleSystemDetails(system) ? (
                                        <Actions 
                                            seeActionsIcon={dots}
                                            collapseActionsIcon={x} 
                                            itemId={system.id}
                                            onView={() => fetchAPIKey(system.id)}
                                            onEdit={user.groups?.includes('admin') ? () => redirect(`/session/admin/sistemas/${system.id}/edit/`, {state: system.id}) : undefined}
                                            onDelete={user.groups?.includes('admin') ? () => setIsOpen(true) : undefined}
                                        />
                                    ) : null
                                }
                            </button>
                            {
                                isOpen ? (
                                    <Modal setIsOpen={setIsOpen}>
                                        <FormContainer title={system.name} formTip={"Copie e cole este código no arquivo de configurações do backend do seu projeto"} width='50%'>
                                            <div className={styles.formGroup}>
                                                ID do sistema
                                                <p className={styles.content}>
                                                    {apiKey}
                                                </p>
                                            </div>
                                        </FormContainer>
                                    </Modal>
                                ) : null
                            }
                            </>
                        ))
                    }
                </div>
                {
                    next ? (
                        <button className={styles.nextButton} onClick={() => setCurrentPage((prev) => prev + 1)}>
                            <img src={doubleArrow} alt="próxima página" className={styles.icon}/>
                        </button>
                    ) : null
                }
            </section>
        </>
    )
}

export default Menu