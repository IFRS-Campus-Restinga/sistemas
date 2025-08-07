import { useEffect, useState } from 'react'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import styles from './SystemForm.module.css'
import tableStyles from '../../../../components/table/Table.module.css'
import { validateMandatoryArrayField, validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomSelect, { type OptionProps } from '../../../../components/customSelect/CustomSelect'
import CustomOptions from '../../../../components/customOptions/CustomOptions'
import search from '../../../../assets/search-alt-svgrepo-com.svg'
import x from '../../../../assets/close-svgrepo-com.svg'
import UserService from '../../../../services/userService'
import ErrorMessage from '../../../../components/errorMessage/ErrorMessage'
import CustomButton from '../../../../components/customButton/CustomButton'
import { SystemService, type System } from '../../../../services/systemService'
import DynamicTable from '../../../../components/table/tablesComponents/DynamicTable'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import FormContainer from '../../../../components/formContainer/FormContainer'
import { AxiosError } from 'axios'

export interface SystemFormErrors {
    name: string | null
    system_url: string | null
    dev_team: string | null
    secret_key: string |null
    groups: string | null
}

const SystemForm = () => {
    const redirect = useNavigate()
    const location = useLocation()
    const {state} = location
    const [inputSearch, setInputSearch] = useState<string>('')
    const [optionsOpen, setOptionsOpen] = useState<boolean>(false)
    const [userOptions, setUserOptions] = useState([])
    const [devTeamViewList, setDevTeamViewList] = useState<string[]>([])
    const [errors, setErrors] = useState<SystemFormErrors>({
        dev_team: null,
        name: null,
        system_url: null,
        secret_key: null,
        groups: null
    })
    const [systemForm, setSystemForm] = useState<System>({
        system_url: '',
        current_state: 'Em desenvolvimento',
        dev_team: [],
        is_active: false,
        name: '',
        secret_key: '',
        groups: []
    })

    const searchUsers = async () => {
        try {
            const res = await UserService.listByAccessProfile('aluno', inputSearch, undefined, 'search', true)

            if (res.status !== 200) throw new Error(res.data?.message)

            setUserOptions(res.data.results ?? res.data)
            setOptionsOpen(true)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchSystem = async () => {
        try {
            const res = await SystemService.get(state)

            setSystemForm(res.data.system)
            setDevTeamViewList(res.data.dev_team)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    const removeUser = (userIndex: number) => {
        setSystemForm({...systemForm, dev_team: systemForm.dev_team.filter((_, index) => userIndex !== index)})
        setDevTeamViewList(devTeamViewList.filter((_, index) => userIndex !== index))
    }

    const addUser = (option: OptionProps<'id'>) => {
        if (!systemForm.dev_team.includes(option.id)) {
            setSystemForm({...systemForm, dev_team: [...systemForm.dev_team, option.id]})
            setDevTeamViewList([...devTeamViewList, option.title])
        }

        setOptionsOpen(false)
    }

    const validateForm = () => {
        let errors: SystemFormErrors = {
            dev_team: null,
            groups: null,
            name: null,
            secret_key: null,
            system_url: null,
        }

        for (let field in systemForm) {
            switch (field) {
                case 'name':
                    errors.name = validateMandatoryStringField(systemForm[field])
                    break;
                case 'system_url':
                    errors.system_url = validateMandatoryStringField(systemForm[field])
                    break;
                case 'secret_key':
                    errors.secret_key = validateMandatoryStringField(systemForm[field])
                    break;
                case 'dev_team':
                    errors.dev_team = validateMandatoryArrayField(systemForm[field], 'A equipe de desenvolvimento deve possuir ao menos 1 aluno')
                    break;
                case 'groups':
                    errors.groups = validateMandatoryArrayField(systemForm[field], 'O sistema deve possuir ao menos um grupo de acesso')
                    break;
                default:
                    break;
            }
        }

        return errors
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            toast.promise(
                state ?
                SystemService.edit(state, systemForm) :
                SystemService.create(systemForm),
                {
                    pending: "Cadastrando sistema...",
                    success: "Sistema cadastrado com sucesso!",
                    error: {
                        render({ data }: any) {
                            return data.message || 'Erro ao cadastrar'
                        }
                    } 
                },
                {
                    autoClose: 2000,
                    position: 'bottom-center'
                }
            ).then(() => {
                setTimeout(() => {
                    redirect('/session/admin/home')
                }, 2000);
            })
        }
    }

    useEffect(() => {
        if (state) fetchSystem()
    }, [state])

    return (
        <section className={styles.section}>
            <ToastContainer/>
            <FormContainer
                title='Cadastro de Sistema' 
                formTip={"Preencha os campos obrigatórios (*)\n\nPesquise e adicione alunos à equipe de desenvolvimento do projeto\n\nAdicione grupos de acesso ao projeto usando o sinal de '+' na tabela dinâmica abaixo"}
            >
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <CustomLabel title='Nome *'>
                        <CustomInput
                            type='text'
                            value={systemForm.name}
                            max={50}
                            error={errors.name}
                            onChange={(e) => {
                                setSystemForm({ ...systemForm, name: e.target.value })
                            }}
                            onBlur={() => {
                                setErrors({ ...errors, name: validateMandatoryStringField(systemForm.name) })
                            }}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='URL/Domínio do sistema *'>
                        <CustomInput
                            type='text'
                            value={systemForm.system_url}
                            max={255}
                            error={errors.system_url}
                            onChange={(e) => {
                                setSystemForm({ ...systemForm, system_url: e.target.value })
                            }}
                            onBlur={() => {
                                setErrors({ ...errors, system_url: validateMandatoryStringField(systemForm.system_url) })
                            }}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='Secret Key *'>
                        <CustomInput
                            type='text'
                            value={systemForm.secret_key}
                            max={255}
                            error={errors.secret_key}
                            placeholder='Insira a SECRET_KEY que consta na configurações do projeto'
                            onChange={(e) => {
                                setSystemForm({ ...systemForm, secret_key: e.target.value })
                            }}
                            onBlur={() => {
                                setErrors({ ...errors, secret_key: validateMandatoryStringField(systemForm.secret_key) })
                            }}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='Estado atual *'>
                        <CustomSelect
                            value={systemForm.current_state}
                            onChange={(e) => setSystemForm({ ...systemForm, current_state: e.target.value })}
                            options={[
                                {
                                    title: 'Em desenvolvimento',
                                    value: 'Em desenvolvimento',
                                },
                                {
                                    title: 'Implantado',
                                    value: 'Implantado',
                                },
                            ]}
                        />
                    </CustomLabel>
                    <CustomLabel title='Ativo/Inativo *'>
                        <CustomSelect
                            value={systemForm.is_active ? 'Ativo' : 'Inativo'}
                            onChange={(e) => setSystemForm({ ...systemForm, is_active: e.target.value === 'Ativo' ? true : false })}
                            options={[
                                {
                                    title: 'Ativo',
                                    value: 'Ativo',
                                },
                                {
                                    title: 'Inativo',
                                    value: "Inativo",
                                },
                            ]}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroupContainer}>
                    <div className={styles.formGroup}>
                        <div className={styles.tableFormGroup}>
                            <div className={styles.searchContainer}>
                                <div className={styles.inputContainer}>
                                    <CustomInput
                                        type='text'
                                        placeholder='Pesquise um aluno por nome, email ou matrícula'
                                        value={inputSearch}
                                        max={50}
                                        onChange={(e) => {
                                            setInputSearch(e.target.value)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e && e.key === 'Enter') {
                                                searchUsers()
                                            }
                                        }}
                                    />
                                    {errors.dev_team ? <ErrorMessage message={errors.dev_team}/> : null}
                                    {
                                        optionsOpen ? (
                                            <CustomOptions
                                                options={userOptions}
                                                onSelect={(option) => {
                                                    addUser(option)
                                                    setInputSearch('')
                                                }}
                                            />
                                        ) : null
                                    }
                                </div>
                                <div className={styles.searchTools}>
                                    <img className={styles.tool} src={search} alt="search" onClick={() => searchUsers()} />
                                    <img className={styles.tool} src={x} alt="clear" onClick={() => {
                                        setInputSearch('')
                                        setOptionsOpen(false)
                                    }} />
                                </div>
                            </div>
                            <div className={tableStyles.tableContainer}>
                                <table className={tableStyles.table}>
                                    <thead className={tableStyles.thead}>
                                        <tr className={tableStyles.tr}>
                                            <th className={tableStyles.th}>Alunos</th>
                                            <th className={tableStyles.thAction}/>
                                        </tr>
                                    </thead>
                                    <tbody className={tableStyles.tbody}>
                                        {devTeamViewList.map((option, index) => (
                                            <tr className={tableStyles.tr}>
                                                <td className={tableStyles.td}>{option}</td>
                                                <td className={tableStyles.tdAction}>
                                                    <img src={x} className={tableStyles.remove} alt="remover" onClick={() => removeUser(index)}/>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={styles.tableFormGroup}>
                            <h2 className={styles.h2}>Grupos de acesso *</h2>
                            {errors.groups ? <ErrorMessage message={errors.groups}/> : null}
                            <DynamicTable
                                itemTitle='Grupos'
                                items={systemForm.groups}
                                setItems={(newGroups) => setSystemForm((prev) => ({ ...prev, groups: newGroups }))}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <CustomButton text='Cadastrar' type='submit'/>
                </div>
            </form>
            </FormContainer>
        </section>
    )
}

export default SystemForm