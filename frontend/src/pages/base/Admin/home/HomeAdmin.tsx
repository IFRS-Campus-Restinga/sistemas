import styles from './HomeAdmin.module.css'
import { useEffect, useState } from 'react';
import Menu from '../../../../components/menu/Menu';
import UserService, { type RequestGroup, type RequestInterface } from '../../../../services/userService';
import { toast } from 'react-toastify';
import Table from '../../../../components/table/tablesComponents/Table';
import FormContainer from '../../../../components/formContainer/FormContainer';
import DualTableTransfer from '../../../../components/table/tablesComponents/DualTableTransfer';
import GroupService from '../../../../services/groupService';
import CustomButton from '../../../../components/customButton/CustomButton';
import Switch from '../../../../components/switch/Switch';
import Modal from '../../../../components/modal/Modal';

const translations = {
    "id": "id",
    "username": "nome",
    "email": "email",
    "access_profile": "perfil de acesso",
}

const HomeAdmin = () => {
    const [requests, setRequests] = useState<Record<string, any>[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true)
    const [current, setCurrent] = useState<number>(1)
    const [next, setNext] = useState<number | null>(null)
    const [prev, setPrev] = useState<number | null>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [groups, setGroups] = useState<RequestGroup[]>([])
    const [approvedRequest, setApprovedRequest] = useState<RequestInterface>({
        id: '',
        username: '',
        email: '',
        access_profile: '',
        is_abstract: false,
        groups: []
    })

    const fetchRequests = async () => {
        try {
            const res = await UserService.getRequests(current, 'id, username, email, access_profile')

            setRequests(res.data.results)

            setNext(res.data.next ? current + 1 : null)
            setPrev(res.data.prev ? current - 1 : null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchGroups = async () => {
        setIsLoadingGroups(true)

        try {
            const res = await GroupService.list(current, '', 'id, name')

            setGroups([...groups, ...res.data.results])
            setNext(res.data.next ? current + 1 : null)
            setPrev(res.data.prev ? current - 1 : null)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoadingGroups(false)
        }
    }

    const setUserGroups = (newGroups: React.SetStateAction<RequestGroup[]>) => {
        setApprovedRequest(prevReq => {
            // Se newGroups for função, chama ela com prevReq.groups para obter o novo array
            const updatedGroups = typeof newGroups === 'function'
            ? (newGroups as (prev: RequestGroup[]) => RequestGroup[])(prevReq.groups)
            : newGroups

            return {
            ...prevReq,
            groups: updatedGroups,
            }
        })
    }

    const openApproveModal = async (request: Record<string, any>) => {
        setIsModalOpen(true)
        setApprovedRequest({
            id: request.id,
            access_profile: request.access_profile,
            email: request.email,
            username: request.username,
            is_abstract: approvedRequest.is_abstract,
            groups: []
        })
        
        await fetchGroups()
    }

    const approveRequest = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await UserService.approveRequest(approvedRequest)

            setRequests((prev) => prev.filter((req) => req.id !== approvedRequest.id))
            setIsModalOpen(false)
            setApprovedRequest({
                access_profile: '',
                email: '',
                id: '',
                is_abstract: false,
                username: '',
                groups: []
            })
        } catch (error) {
            if (error instanceof Error) {
                toast.error(
                    error.message,
                    {
                        autoClose: 3000,
                        position: 'bottom-center'
                    }
                )
            } else {
                console.error(error)
            }
        }
    }

    const declineRequest = async (requestId: string) => {
        try {
            await UserService.declineRequest(requestId)
            
            setRequests((prev) => prev.filter((req) => req.id !== requestId))
        } catch (error) {
            if (error instanceof Error) {
                toast.error(
                    error.message,
                    {
                        autoClose: 3000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    return (
        <section className={styles.home}>
            <Menu/>
            <div className={styles.requestsContainer}>
                <FormContainer title='Requisições de Acesso' formTip="Para ativar a conta de um usuário, clique no 'v', ou no 'x' para recusar o acesso">
                    {
                        requests.length > 0 ? (
                            <Table
                                current={current}
                                fetchData={fetchRequests}
                                itemList={requests}
                                loadingContent={isLoading}
                                next={next}
                                previous={prev}
                                setCurrent={setCurrent}
                                dualActions={{
                                    onApprove: openApproveModal,
                                    onDecline: declineRequest
                                }}
                                translations={translations}
                            />
                        ) : (
                            <div className={styles.messageContainer}>
                                <p className={styles.message}>Não há requisições de acesso pendentes</p>
                            </div>
                        )
                    }
                </FormContainer>
                {
                    isModalOpen ? (
                        <Modal 
                            setIsOpen={(isOpen) => {
                                if (!isOpen) {
                                    setApprovedRequest({
                                        id: '',
                                        username: '',
                                        email: '',
                                        is_abstract: false,
                                        access_profile: '',
                                        groups: []
                                    })

                                    setIsModalOpen(isOpen)
                                    setGroups([])
                                }
                            }}

                        >
                            <FormContainer width='50%' title='Adicionar grupos' formTip="Utilize as tabelas abaixo para vincular grupos ao usuário antes de aprová-lo">
                                <form className={styles.form} onSubmit={approveRequest}>
                                    <div className={styles.userData}>
                                        <div className={styles.data}>
                                            <label className={styles.dataLabel}>
                                                Nome
                                                <p className={styles.requestParam}>{approvedRequest.username}</p>
                                            </label>
                                        </div>
                                        <div className={styles.data}>
                                            <label className={styles.dataLabel}>
                                                Email
                                                <p className={styles.requestParam}>{approvedRequest.email}</p>
                                            </label>
                                        </div>
                                        <div className={styles.data}>
                                            <label className={styles.dataLabel}>
                                                Perfil
                                                <p className={styles.requestParam}>{approvedRequest.access_profile}</p>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.switchContainer}>
                                        Tipo de usuário
                                        <Switch
                                            stateHandler={(value) =>
                                                setApprovedRequest(prev => ({
                                                    ...prev,
                                                    is_abstract: value === 'Abstrato'
                                                }))
                                            }                                                
                                            value={approvedRequest.is_abstract ? 'Abstrato' : 'Pessoal'}
                                            value1='Abstrato'
                                            value2='Pessoal'
                                        />
                                    </div>
                                    <DualTableTransfer
                                        list1={groups}
                                        setList1={setGroups}
                                        list2={approvedRequest.groups!}
                                        setList2={setUserGroups}
                                        fetchData1={fetchGroups}
                                        loadingList1={isLoadingGroups}
                                        currentList1={current}
                                        setCurrentList1={setCurrent}
                                        nextList1={next}
                                        prevList1={prev}
                                        getKey={(group) => group.id}
                                        renderItem={(group) => group.name}
                                        title1='Grupos disponíveis'
                                        title2='Grupos do usuário'
                                    />
                                    <div className={styles.buttonContainer}>
                                        <CustomButton type='submit' text='Ativar conta'/>
                                    </div>
                                </form>
                            </FormContainer>
                        </Modal>
                    ) : null
                }
            </div>
        </section>
    )
}

export default HomeAdmin