import { useLocation, useNavigate } from 'react-router-dom'
import styles from './UserForm.module.css'
import { useEffect, useState } from 'react'
import UserService from '../../services/userService'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import type { PersonalAccountInfosData } from '../../services/personalAccountInfosService'
import PersonalAccountInfosService from '../../services/personalAccountInfosService'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomInput from '../../components/customInput/CustomInput'
import { validateEmail, validateName } from '../../utils/validations/authValidations'
import CustomSelect from '../../components/customSelect/CustomSelect'
import CustomButton from '../../components/customButton/CustomButton'
import type { Group } from '../../services/groupService'
import CustomLoading from '../../components/customLoading/CustomLoading'
import { validateBirthDate, validateCPF, validateMandatoryArrayField, validatePhoneNumber, validateRegistration } from '../../utils/validations/generalValidations'
import DualTableTransfer from '../../components/table/tablesComponents/DualTableTransfer'
import GroupService from '../../services/groupService'
import ErrorMessage from '../../components/errorMessage/ErrorMessage'

export interface UserInterface {
    id?: string
    username: string
    email: string
    access_profile: string
    is_active: boolean
    is_abstract: boolean
    groups: Group[]
}

interface UserErrors {
    username: string | null
    email: string | null
    groups: string | null
}

interface PersonalAccountInfosErrors {
    birth_date: string | null
    telephone_number: string | null
    registration: string | null
    cpf: string | null
}

const UserForm = () => {
    const location = useLocation()
    const { state } = location
    const profile = location.pathname.split('/')[3]
    const redirect = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true)
    const [stage, setStage] = useState<"user"|"infos">("user")
    const [groups, setGroups] = useState<Group[]>([])
    const [groupPage, setGroupPage] = useState<number>(1)
    const [nextGroupPage, setNextGroupPage] = useState<number | null>(null)
    const [prevGroupPage, setPrevGroupPage] = useState<number | null>(null)
    const [userForm, setUserForm] = useState<UserInterface>({
        id: '',
        groups: [],
        access_profile: 'aluno',
        email: '',
        is_abstract: false,
        is_active: true,
        username: '',
    })
    const [infosForm, setInfosForm] = useState<PersonalAccountInfosData>({
        personal_infos: { birth_date: '', cpf: '' },
        account_infos: { registration: '', telephone_number: '' },
        user: state
    })
    const [userErrors, setUserErrors] = useState<UserErrors>({
        email: null,
        username: null,
        groups: null
    })
    const [infosErrors, setInfosErrors] = useState<PersonalAccountInfosErrors>({
        birth_date: null,
        cpf: null,
        registration: null,
        telephone_number: null
    })

    const fetchData = async () => {
        const res = await Promise.allSettled([
            UserService.get(state, 'id, username, email, is_active, is_abstract, access_profile, groups.id, groups.name'),
            PersonalAccountInfosService.get(state, 'personal_infos.id, personal_infos.birth_date, personal_infos.cpf, account_infos.id, account_infos.registration, account_infos.telephone_number')
        ])

        if (res[0].status === 'fulfilled') {
            setUserForm(res[0].value.data)
        } else {
            const error = res[0].reason
            if (error instanceof AxiosError) toast.error(error.response?.data.message)
        }

        if (res[1].status === 'fulfilled') {
            setInfosForm({
                user: state,
                personal_infos: res[1].value.data.personal_infos ?? { birth_date: '', cpf: '' },
                account_infos: res[1].value.data.account_infos ?? { registration: '', telephone_number: '' }
            })
        }

        setIsLoading(false)
    }

    const fetchGroups = async () => {
        try {
            const res = await GroupService.getAvailable(state, groupPage, 'id, name')

            setGroups(res.data.results)
            setNextGroupPage(res.data.next ? groupPage + 1 : null)
            setPrevGroupPage(res.data.prev ? groupPage - 1 : null)
        } catch (error) {
            if (error instanceof AxiosError) {  
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        } finally {
            setIsLoadingGroups(false)
        }
    }

    const setUserGroups = (newGroups: React.SetStateAction<Group[]>) => {
        setUserForm((prev) => ({
            ...prev,
            groups: typeof newGroups === 'function'
            ? (newGroups as (prev: Group[]) => Group[])(prev.groups)
            : newGroups
        }));
    };

    const validateGroups = (group: Group, userGroups: Group[]) => {
        const groupName = group.name

        if (groupName === 'user' && userGroups.find((group) => group.name === 'admin')) {
            setUserErrors({...userErrors, groups: 'O grupo admin não pode coexistir com o grupo user'})
            return 'O grupo admin não pode coexistir com o grupo user'
        }

        if (groupName === 'admin' && userGroups.find((group) => group.name === 'user')) {
            setUserErrors({...userErrors, groups: 'O grupo admin não pode coexistir com o grupo user'})
            return 'O grupo admin não pode coexistir com o grupo user'
        }

        if ((groupName === 'admin' && userForm.access_profile === 'aluno') ||
        (groupName === 'admin' && userForm.access_profile === 'convidado')) {
            setUserErrors({...userErrors, groups: 'Apenas usuários com perfil de acesso de Servidor podem possuir o grupo admin'})
            return 'Apenas usuários com perfil de acesso de Servidor podem possuir o grupo admin'
        }

        if (groupName === 'coord' && userForm.access_profile === 'convidado') {
            setUserErrors({...userErrors, groups: 'Usuários com perfil convidado não podem ter o grupo coord'})
            return 'Usuários com perfil convidado não podem ter o grupo coord'
        }

        return null
    }

    const validateUserForm = () => {
        let errors: UserErrors = {
            email: null,
            groups: null,
            username: null
        }

        for (let field in userForm) {
            switch (field) {
                case 'username':
                    errors.username = validateName(userForm.username)
                    break;
                case 'email':
                    errors.email = validateEmail(userForm.email)
                    break;
                case 'groups':
                    errors.groups = validateMandatoryArrayField(userForm.groups)
                    break;
                default:
                    break;
            }
        }

        setUserErrors(errors)
        return Object.values(errors).every((error) => error === null)
    }

    const validateInfosForm = () => {
        const errors: PersonalAccountInfosErrors = {
            birth_date: null,
            cpf: null,
            registration: null,
            telephone_number: null
        }

        errors.cpf = validateCPF(infosForm.personal_infos.cpf)
        errors.telephone_number = validatePhoneNumber(infosForm.account_infos.telephone_number)
        errors.birth_date = validateBirthDate(infosForm.personal_infos.birth_date)
        if (userForm.access_profile !== 'convidado') {
            errors.registration = validateRegistration(infosForm.account_infos.registration, userForm.access_profile)
        }

        setInfosErrors(errors)
        return Object.values(errors).every((error) => error === null)
    }

    const getProfilePath = (accessProfile?: string) => {
        switch (accessProfile) {
            case 'aluno':
                return 'alunos'
            case 'servidor':
                return 'servidores'
            case 'convidado':
                return 'convidados'
            default:
                return profile
        }
    }

    const submitUser = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateUserForm()) {
            toast.promise(
                UserService.edit(state, userForm),
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
                                if (data.status === 500) return "Ocorreu um erro"
                                return data.response?.data.message
                            }
                        }
                    }
                }
            ).then((res) => {
                if (res.status === 200) {
                    setTimeout(() => {
                        redirect(`/session/${getProfilePath(userForm.access_profile)}/`)
                    }, 2000)
                }
            })
        }
    }

    const submitInfos = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateInfosForm()) {
            toast.promise(
                infosForm.personal_infos.id || infosForm.account_infos.id ?
                PersonalAccountInfosService.edit(state, infosForm) :
                PersonalAccountInfosService.create(infosForm),
                {
                    pending: "Salvando alterações...",
                    success: {
                        render({ data }) {
                            return data.data.message
                        }
                    },
                    error: "Erro de validação"
                }
            ).then((res) => {
                    if (res.status === 201 || res.status === 200) {
                        setTimeout(() => {
                            redirect(`/session/${getProfilePath(userForm.access_profile)}/`)
                        }, 2000);
                    }
            }).catch((err) => {
                if (err instanceof AxiosError) {
                    const errors = err.response?.data?.message;
    
                    if (Array.isArray(errors)) {
                        errors.forEach((msg: string) => toast.error(msg));
                    } else {
                        toast.error(errors);
                    }
                }
            })
        }

    }

    useEffect(() => {
        if (state) {
            fetchData()
            fetchGroups()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <FormContainer title={stage === 'user' ? 'Editar Conta' : "Editar Dados Pessoais e da Conta"} formTip={"Preencha os campos obrigatórios (*)\n\nEm caso de conta pessoal, navegue pelo formulário utilizando as caixas abaixo"}>
            <div className={styles.formHeader}>
                <span className={stage === 'user' ? styles.checkedStageTag : styles.stageTag} onClick={() => setStage('user')}>
                    Dados da Conta
                </span>
                {
                    !userForm.is_abstract ? (
                        <span className={stage === 'infos' ? styles.checkedStageTag : styles.stageTag} onClick={() => setStage('infos')}>
                                Dados Pessoais e da Conta
                        </span>
                    ) : null
                }
            </div>
            <section>
                {
                    stage === 'user' ? (
                        isLoading ? (
                            <CustomLoading/>
                        ) : (
                            <form className={styles.form} onSubmit={submitUser}>
                                <div className={styles.formGroup}>
                                    <CustomLabel title='Nome Completo *'>
                                        <CustomInput
                                            type='text'
                                            value={userForm.username}
                                            onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                                            onBlur={() => setUserErrors({...userErrors, username: validateName(userForm.username)})}
                                            error={userErrors.username}
                                        />
                                    </CustomLabel>
                                </div>
                                <div className={styles.formGroup}>
                                    <CustomLabel title='Email *'>
                                        <CustomInput
                                            type='text'
                                            value={userForm.email}
                                            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                                            onBlur={() => setUserErrors({...userErrors, email: validateEmail(userForm.email)})}
                                            error={userErrors.email}
                                        />
                                    </CustomLabel>
                                </div>
                                <div className={styles.formGroup}>
                                    <CustomLabel title='Perfil de Acesso *'>
                                        <CustomSelect
                                            options={[
                                                {
                                                    title: 'Aluno',
                                                    value: 'aluno'
                                                },
                                                {
                                                    title: 'Servidor',
                                                    value: 'servidor'
                                                },
                                                {
                                                    title: 'Convidado',
                                                    value: 'convidado'
                                                },

                                            ]}
                                            onSelect={(option) => {
                                                if ('value' in option) {
                                                    const nextProfile = option.value
                                                    setUserForm((prev) => ({
                                                        ...prev,
                                                        access_profile: nextProfile,
                                                        is_abstract: nextProfile === 'aluno' ? false : prev.is_abstract
                                                    }))
                                                }
                                            }}
                                            selected={{
                                                title: userForm.access_profile,
                                                value: userForm.access_profile,
                                            }}
                                            renderKey='title'
                                        />
                                    </CustomLabel>
                                    <CustomLabel title='Status *'>
                                        <CustomSelect
                                            options={[
                                                {
                                                    title: 'Ativo',
                                                    value: 'Ativo'
                                                },
                                                {
                                                    title: 'Inativo',
                                                    value: 'Inativo'
                                                },
                                            ]}
                                            onSelect={(option) => {
                                                if ('value' in option) setUserForm({...userForm, is_active: option.value === 'Ativo' ? true : false})
                                            }}
                                            selected={{
                                                title: userForm.is_active ? 'Ativo' : 'Inativo',
                                                value: userForm.is_active ? 'Ativo' : 'Inativo',
                                            }}
                                            renderKey='title'
                                        />
                                    </CustomLabel>
                                </div>
                                <div className={styles.formGroup}>
                                    <CustomLabel title='Tipo de Conta *'>
                                        <CustomSelect
                                            options={[
                                                {
                                                    title: 'Pessoal',
                                                    value: 'Pessoal'
                                                },
                                                {
                                                    title: 'Departamento',
                                                    value: 'Departamento'
                                                },
                                            ]}
                                            onSelect={(option) => {
                                                if ('value' in option) {
                                                    const nextIsAbstract = option.value !== 'Pessoal'
                                                    if (infosForm.personal_infos.id || infosForm.account_infos.id) {
                                                        return
                                                    }
                                                    if (userForm.access_profile === 'aluno' && nextIsAbstract) {
                                                        return
                                                    }
                                                    setUserForm({...userForm, is_abstract: nextIsAbstract})
                                                }
                                            }}
                                            disabled={Boolean(infosForm.personal_infos.id || infosForm.account_infos.id)}
                                            selected={{
                                                title: userForm.is_abstract ? 'Departamento' : 'Pessoal',
                                                value: userForm.is_abstract ? 'Departamento' : 'Pessoal',
                                            }}
                                            renderKey='title'
                                        />
                                        {userForm.access_profile === 'aluno' ? (
                                            <ErrorMessage message="Aluno não pode ter conta do tipo Departamento." />
                                        ) : null}
                                    </CustomLabel>
                                </div>
                                <div className={styles.formGroupTable}>
                                    <CustomLabel title='Grupos *'>
                                        <DualTableTransfer
                                            fetchData1={fetchGroups}
                                            list1={groups}
                                            list2={userForm.groups}
                                            prevList1={prevGroupPage}
                                            currentList1={groupPage}
                                            nextList1={nextGroupPage}
                                            loadingList1={isLoadingGroups}
                                            setCurrentList1={setGroupPage}
                                            setList1={setGroups}
                                            setList2={setUserGroups}
                                            title1='Grupos Disponíveis'
                                            title2='Grupos do Usuário'
                                            renderItem={(group) => group.name}
                                            getKey={(group) => group.id!}
                                            validate={validateGroups}
                                        />
                                    </CustomLabel>
                                    {userErrors.groups ? <ErrorMessage message={userErrors.groups} /> : null}
                                </div>
                                <div className={styles.buttonContainer}>
                                    <CustomButton text={"Salvar Alterações"} type='submit'/>
                                </div>
                            </form>
                        )
                    ) : (
                        isLoading ? (
                            <CustomLoading/>
                        ) : (
                            <form className={styles.form} onSubmit={submitInfos}>
                                <div className={styles.formGroup}>
                                    <CustomLabel title='CPF *'>
                                        <CustomInput
                                            type='text'
                                            value={infosForm.personal_infos.cpf}
                                            onChange={(e) => {
                                                if (!isNaN(e.target.value)) setInfosForm({...infosForm, personal_infos: {...infosForm.personal_infos, cpf: e.target.value}})
                                            }}
                                            onBlur={() => setInfosErrors({...infosErrors, cpf: validateCPF(infosForm.personal_infos.cpf)})}
                                            error={infosErrors.cpf}
                                        />
                                    </CustomLabel>
                                    <CustomLabel title='Contato *'>
                                        <CustomInput
                                            type='text'
                                            value={infosForm.account_infos.telephone_number}
                                            onChange={(e) => {
                                                if (!isNaN(e.target.value)) setInfosForm({...infosForm, account_infos: {...infosForm.account_infos, telephone_number: e.target.value}})
                                            }}
                                            onBlur={() => setInfosErrors({...infosErrors, telephone_number: validatePhoneNumber(infosForm.account_infos.telephone_number)})}
                                            error={infosErrors.telephone_number}
                                        />
                                    </CustomLabel>
                                </div>
                                <div className={styles.formGroup}>
                                    <CustomLabel title='Data de nascimento *'>
                                        <CustomInput
                                            type='date'
                                            value={infosForm.personal_infos.birth_date}
                                            onChange={(e) => setInfosForm({...infosForm, personal_infos: {...infosForm.personal_infos, birth_date: e.target.value}})}
                                            onBlur={() => setInfosErrors({...infosErrors, birth_date: validateBirthDate(infosForm.personal_infos.birth_date)})}
                                            error={infosErrors.birth_date}
                                        />
                                    </CustomLabel>
                                    {
                                        userForm.access_profile !== 'convidado' ? (
                                            <CustomLabel title='Matrícula *'>
                                                <CustomInput
                                                    type='text'
                                                    value={infosForm.account_infos.registration}
                                                    onChange={(e) => {
                                                        if (!isNaN(e.target.value)) setInfosForm({...infosForm, account_infos: {...infosForm.account_infos, registration: e.target.value}})
                                                    }}
                                                    onBlur={() => setInfosErrors({...infosErrors, registration: validateRegistration(infosForm.account_infos.registration, userForm.access_profile)})}
                                                    error={infosErrors.registration}
                                                />
                                            </CustomLabel>
                                        ) : null
                                    }
                                </div>
                                <div className={styles.buttonContainer}>
                                    <CustomButton text={infosForm.personal_infos.id || infosForm.account_infos.id ? 'Salvar Alterações' : 'Cadastrar'} type='submit'/>
                                </div>
                            </form>
                        )
                    )
                }
            </section>
        </FormContainer>
    )

}

export default UserForm
