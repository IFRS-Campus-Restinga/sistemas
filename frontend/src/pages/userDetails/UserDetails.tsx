import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomInput from '../../components/customInput/CustomInput'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomSelect from '../../components/customSelect/CustomSelect'
import CustomLoading from '../../components/customLoading/CustomLoading'
import UserService from '../../services/userService'
import PersonalAccountInfosService, { type PersonalAccountInfosData } from '../../services/personalAccountInfosService'
import type { Group } from '../../services/groupService'
import styles from './UserDetails.module.css'

interface UserDetailsData {
    username: string
    email: string
    access_profile: string
    is_active: boolean
    is_abstract: boolean
    groups: Group[]
}

const emptyUser: UserDetailsData = {
    username: '',
    email: '',
    access_profile: '',
    is_active: false,
    is_abstract: false,
    groups: []
}

const emptyPersonalAccountInfos: PersonalAccountInfosData = {
    personal_infos: { birth_date: '', cpf: '' },
    account_infos: { registration: '', telephone_number: '' },
    user: ''
}

const UserDetails = () => {
    const location = useLocation()
    const params = useParams()
    const userId = location.state ?? params.userId
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<UserDetailsData>(emptyUser)
    const [infos, setInfos] = useState<PersonalAccountInfosData>(emptyPersonalAccountInfos)

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setIsLoading(false)
                return
            }

            const [userResult, infosResult] = await Promise.allSettled([
                UserService.get(userId, 'id, username, email, is_active, is_abstract, access_profile, groups.id, groups.name'),
                PersonalAccountInfosService.get(userId, 'personal_infos.id, personal_infos.birth_date, personal_infos.cpf, account_infos.id, account_infos.registration, account_infos.telephone_number')
            ])

            if (userResult.status === 'fulfilled') {
                setUser(userResult.value.data)
            } else {
                const error = userResult.reason
                if (error instanceof AxiosError) toast.error(error.response?.data.message)
            }

            if (infosResult.status === 'fulfilled') {
                setInfos({
                    user: userId,
                    personal_infos: infosResult.value.data.personal_infos ?? emptyPersonalAccountInfos.personal_infos,
                    account_infos: infosResult.value.data.account_infos ?? emptyPersonalAccountInfos.account_infos
                })
            } else {
                const error = infosResult.reason
                if (error instanceof AxiosError && error.response?.status !== 404) toast.error(error.response?.data.message)
            }

            setIsLoading(false)
        }

        fetchData()
    }, [userId])

    return (
        <FormContainer title="Detalhes da Conta" formTip="Visualização dos dados pessoais e da conta">
            {isLoading ? (
                <CustomLoading />
            ) : (
                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Dados da Conta</h3>
                        <div className={styles.formGroup}>
                            <CustomLabel title="Nome Completo">
                                <CustomInput type="text" value={user.username} onChange={() => {}} disabled />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title="Email">
                                <CustomInput type="text" value={user.email} onChange={() => {}} disabled />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title="Perfil de Acesso">
                                <CustomSelect
                                    options={[
                                        { title: 'Aluno', value: 'aluno' },
                                        { title: 'Servidor', value: 'servidor' },
                                        { title: 'Convidado', value: 'convidado' }
                                    ]}
                                    onSelect={() => {}}
                                    selected={{ title: user.access_profile, value: user.access_profile }}
                                    renderKey="title"
                                    disabled
                                />
                            </CustomLabel>
                            <CustomLabel title="Status">
                                <CustomSelect
                                    options={[
                                        { title: 'Ativo', value: 'Ativo' },
                                        { title: 'Inativo', value: 'Inativo' }
                                    ]}
                                    onSelect={() => {}}
                                    selected={{ title: user.is_active ? 'Ativo' : 'Inativo', value: user.is_active ? 'Ativo' : 'Inativo' }}
                                    renderKey="title"
                                    disabled
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title="Tipo de Conta">
                                <CustomSelect
                                    options={[
                                        { title: 'Pessoal', value: 'Pessoal' },
                                        { title: 'Departamento', value: 'Departamento' }
                                    ]}
                                    onSelect={() => {}}
                                    selected={{ title: user.is_abstract ? 'Departamento' : 'Pessoal', value: user.is_abstract ? 'Departamento' : 'Pessoal' }}
                                    renderKey="title"
                                    disabled
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroupColumn}>
                            <CustomLabel title="Grupos">
                                {user.groups.length > 0 ? (
                                    <table className={styles.groupTable}>
                                        <thead>
                                            <tr>
                                                <th>Grupo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.groups.map((group) => (
                                                <tr key={group.id}>
                                                    <td>{group.name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <span className={styles.emptyValue}>Nenhum grupo vinculado</span>}
                            </CustomLabel>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>Dados pessoais</h3>
                        <div className={styles.formGroup}>
                            <CustomLabel title="CPF">
                                <CustomInput type="text" value={infos.personal_infos.cpf} onChange={() => {}} disabled />
                            </CustomLabel>
                            <CustomLabel title="Contato">
                                <CustomInput type="text" value={infos.account_infos.telephone_number} onChange={() => {}} disabled />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title="Data de nascimento">
                                <CustomInput type="date" value={infos.personal_infos.birth_date} onChange={() => {}} disabled />
                            </CustomLabel>
                            {user.access_profile !== 'convidado' ? (
                                <CustomLabel title="Matrícula">
                                    <CustomInput type="text" value={infos.account_infos.registration} onChange={() => {}} disabled />
                                </CustomLabel>
                            ) : null}
                        </div>
                    </section>
                </div>
            )}
        </FormContainer>
    )
}

export default UserDetails
