import styles from './HomeAdmin.module.css'
import { useEffect, useState } from 'react';
import Menu from '../../../../components/menu/Menu';
import UserService, { type RequestGroup, type RequestInterface } from '../../../../services/userService';
import { toast } from 'react-toastify';
import Table from '../../../../components/table/tablesComponents/Table';
import FormContainer from '../../../../components/formContainer/FormContainer';
import DualTableTransfer from '../../../../components/table/tablesComponents/DualTableTransfer';
import GroupService, { type Group } from '../../../../services/groupService';
import CustomButton from '../../../../components/customButton/CustomButton';
import Switch from '../../../../components/switch/Switch';
import Modal from '../../../../components/modal/Modal';
import ErrorMessage from '../../../../components/errorMessage/ErrorMessage';
import { AxiosError } from 'axios';

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
    const [error, setError] = useState<string | null>(null)
    const [selectedRequest, setSelectedRequest] = useState<RequestInterface>({
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
        setSelectedRequest(prevReq => {
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
        setSelectedRequest({
            id: request.id,
            access_profile: request.access_profile,
            email: request.email,
            username: request.username,
            is_abstract: selectedRequest.is_abstract,
            groups: []
        })
        
        await fetchGroups()
    }

    const approveRequest = async (e: React.FormEvent) => {
        e.preventDefault()

        toast.promise(
            UserService.approveRequest(selectedRequest),
            {
                pending: "Salvando alterações...",
                success: {
                    render({ data }) {
                       return data.data.message
                    }
                },
                error: {
                    render({ data }) {
                        if (data instanceof AxiosError) {
                            return data.response?.data.message || 'Ocorreu um erro'
                        }
                    }
                }
            }
        )

        setRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id))
        setError(null)
        setIsModalOpen(false)
        setGroups([])
        setSelectedRequest({
            access_profile: '',
            email: '',
            id: '',
            is_abstract: false,
            username: '',
            groups: []
        })
    }

    const declineRequest = async (requestId: string) => {
        toast.promise(
            UserService.declineRequest(requestId),
            {
                pending: "Salvando alterações...",
                success: {
                    render({ data }) {
                       return data.data.message
                    }
                },
                error: {
                    render({ data }) {
                        if (data instanceof AxiosError) {
                            return data.response?.data.message || 'Ocorreu um erro'
                        }
                    }
                }
            }

        )

        setRequests((prev) => prev.filter((req) => req.id !== requestId))
        setError(null)
        setIsModalOpen(false)
        setGroups([])
        setSelectedRequest({
            access_profile: '',
            email: '',
            id: '',
            is_abstract: false,
            username: '',
            groups: []
        })
    }

    const validateGroups = (group: Group, userGroups: Group[]) => {
            const groupName = group.name
    
            if (groupName === 'user' && userGroups.find((group) => group.name === 'admin')) {
                setError('O grupo admin não pode coexistir com o grupo user')
                return 'O grupo admin não pode coexistir com o grupo user'
            }
    
            if (groupName === 'admin' && userGroups.find((group) => group.name === 'user')) {
                setError('O grupo admin não pode coexistir com o grupo user')
                return 'O grupo admin não pode coexistir com o grupo user'
            }
    
            if ((groupName === 'admin' && selectedRequest.access_profile === 'aluno') ||
            (groupName === 'admin' && selectedRequest.access_profile === 'convidado')) {
                setError('Apenas usuários com perfil de acesso de Servidor podem possuir o grupo admin')
                return 'Apenas usuários com perfil de acesso de Servidor podem possuir o grupo admin'
            }
    
            return null
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
                                    setSelectedRequest({
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
                                                <p className={styles.requestParam}>{selectedRequest.username}</p>
                                            </label>
                                        </div>
                                        <div className={styles.data}>
                                            <label className={styles.dataLabel}>
                                                Email
                                                <p className={styles.requestParam}>{selectedRequest.email}</p>
                                            </label>
                                        </div>
                                        <div className={styles.data}>
                                            <label className={styles.dataLabel}>
                                                Perfil
                                                <p className={styles.requestParam}>{selectedRequest.access_profile}</p>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={styles.switchContainer}>
                                        Tipo de Conta
                                        <Switch
                                            stateHandler={(value) =>
                                                setSelectedRequest(prev => ({
                                                    ...prev,
                                                    is_abstract: value === 'Depart.'
                                                }))
                                            }                                                
                                            value={selectedRequest.is_abstract ? 'Depart.' : 'Pessoal'}
                                            value1='Depart.'
                                            value2='Pessoal'
                                            width='11.5 rem'
                                        />
                                    </div>
                                    <DualTableTransfer
                                        list1={groups}
                                        setList1={setGroups}
                                        list2={selectedRequest.groups!}
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
                                        validate={validateGroups}
                                    />
                                    {error ? <ErrorMessage align='center' message={error}/> : null}
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