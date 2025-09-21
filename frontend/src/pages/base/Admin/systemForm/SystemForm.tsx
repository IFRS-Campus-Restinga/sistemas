import { useEffect, useState } from 'react'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import styles from './SystemForm.module.css'
import tableStyles from '../../../../components/table/Table.module.css'
import { validateMandatoryArrayField, validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomSelect from '../../../../components/customSelect/CustomSelect'
import { type OptionProps } from '../../../../components/customOptions/CustomOptions'
import CustomOptions from '../../../../components/customOptions/CustomOptions'
import search from '../../../../assets/search-alt-svgrepo-com.svg'
import x from '../../../../assets/close-svgrepo-com.svg'
import UserService from '../../../../services/userService'
import ErrorMessage from '../../../../components/errorMessage/ErrorMessage'
import CustomButton from '../../../../components/customButton/CustomButton'
import { SystemService, type System } from '../../../../services/systemService'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import FormContainer from '../../../../components/formContainer/FormContainer'
import { AxiosError } from 'axios'
import CustomLoading from '../../../../components/customLoading/CustomLoading'

export interface SystemFormErrors {
    name: string | null
    system_url: string | null
    dev_team: string | null
    secret_key: string |null
}

const SystemForm = () => {
    const redirect = useNavigate()
    const location = useLocation()
    const {state} = location
    const [inputSearch, setInputSearch] = useState<string>('')
    const [optionsOpen, setOptionsOpen] = useState<boolean>(false)
    const [userOptions, setUserOptions] = useState([])
    const [devTeamViewList, setDevTeamViewList] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [errors, setErrors] = useState<SystemFormErrors>({
        dev_team: null,
        name: null,
        system_url: null,
        secret_key: null,
    })
    const [systemForm, setSystemForm] = useState<System>({
        system_url: '',
        current_state: 'Em desenvolvimento',
        dev_team: [],
        is_active: false,
        name: '',
        secret_key: '',
    })

    const searchUsers = async () => {
        try {
            const res = await UserService.listByAccessProfile('aluno', inputSearch, undefined, 'id, username', true)

            if (res.status !== 200) throw new Error(res.data?.message)

            setUserOptions(res.data.results ?? res.data)
            setOptionsOpen(true)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchSystem = async () => {
        try {
            const res = await SystemService.get(state, 'id, name, system_url, current_state, is_active, secret_key, dev_team.id, dev_team.username')

            setSystemForm({
                id: res.data.id,
                name: res.data.name,
                system_url: res.data.system_url,
                current_state: res.data.current_state,
                is_active: res.data.is_active,
                secret_key: res.data.secret_key,
                dev_team: res.data.dev_team.map((user: any) => user.id)
            })
            setDevTeamViewList(res.data.dev_team.map((user: any) => user.username))
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const removeUser = (userIndex: number) => {
        setSystemForm({...systemForm, dev_team: systemForm.dev_team.filter((_, index) => userIndex !== index)})
        setDevTeamViewList(devTeamViewList.filter((_, index) => userIndex !== index))
    }

    const addUser = (option: OptionProps<'username'>) => {
        if (!systemForm.dev_team.includes(option.id)) {
            setSystemForm({...systemForm, dev_team: [...systemForm.dev_team, option.id]})
            setDevTeamViewList([...devTeamViewList, option.username])
        }

        setOptionsOpen(false)
    }

    const validateForm = () => {
        let errors: SystemFormErrors = {
            dev_team: null,
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
                    pending: state ? "Salvando alterações..." : "Cadastrando sistema...",
                    success: {
                        render({data}) {
                            return data.data.message
                        }
                    },
                    error: "Erro de validação"
                }
            ).then((res) => {
                    if (res.status === 201 || res.status === 200) {
                        setTimeout(() => {
                            redirect(`/session/admin/home/`);
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
            fetchSystem()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <section className={styles.section}>
            <FormContainer
                title='Cadastro de Sistema' 
                formTip={"Preencha os campos obrigatórios (*)\n\nPesquise e adicione alunos à equipe de desenvolvimento do projeto\n\nAdicione grupos de acesso ao projeto usando o sinal de '+' na tabela dinâmica abaixo"}
            >
            <form className={styles.form} onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                    e.preventDefault(); // impede o envio
                    }
                }}
            >
                {
                    isLoading ? (
                        <CustomLoading/>
                    ) : (
                        <>
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
                                        selected={
                                            {
                                                title: systemForm.current_state,
                                                value: systemForm.current_state
                                            }
                                        }
                                        onSelect={(option) => {
                                            if ('value' in option) {
                                                setSystemForm({ ...systemForm, current_state: option.value })
                                            }
                                        }}
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
                                        renderKey='title'
                                    />
                                </CustomLabel>
                                <CustomLabel title='Ativo/Inativo *'>
                                    <CustomSelect
                                        selected={
                                            {
                                                title: systemForm.is_active ? 'Ativo' : 'Inativo',
                                                value: systemForm.is_active ? 'Ativo' : 'Inativo'
                                            }
                                        }
                                        onSelect={(option) => {
                                            if ('value' in option) {
                                                setSystemForm({ ...systemForm, is_active: option.value === 'Ativo' ? true : false })
                                            }
                                        }}
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
                                        renderKey='title'
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
                                                            renderKey='username'
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
                                                        <th className={tableStyles.thDynamicAction}/>
                                                    </tr>
                                                </thead>
                                                <tbody className={tableStyles.tbody}>
                                                    {devTeamViewList.map((option, index) => (
                                                        <tr className={tableStyles.tr}>
                                                            <td className={tableStyles.td}>{option}</td>
                                                            <td className={tableStyles.tdDynamicAction}>
                                                                <img src={x} className={tableStyles.remove} alt="remover" onClick={() => removeUser(index)}/>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.buttonContainer}>
                                <CustomButton text='Cadastrar' type='submit'/>
                            </div>
                        </>
                    )
                }
            </form>
            </FormContainer>
        </section>
    )
}

export default SystemForm