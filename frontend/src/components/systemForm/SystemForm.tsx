import { useEffect, useState } from 'react'
import CustomInput from '../customInput/CustomInput'
import CustomLabel from '../customLabel/CustomLabel'
import styles from './SystemForm.module.css'
import { validateMandatoryArrayField, validateMandatoryStringField } from '../../utils/validations/generalValidations'
import CustomSelect, { type OptionProps } from '../customSelect/CustomSelect'
import CustomOptions from '../customOptions/CustomOptions'
import search from '../../assets/search-alt-svgrepo-com.svg'
import x from '../../assets/close-svgrepo-com.svg'
import UserService from '../../services/userService'
import type { SystemFormErrors } from '../../pages/base/Admin/createSystem/CreateSystem'
import ErrorMessage from '../errorMessage/ErrorMessage'
import CustomButton from '../customButton/CustomButton'
import type { System } from '../../services/systemService'
import DynamicTable from '../dynamicTable/DynamicTable'


interface SystemFormProps {
    formData: System
    setFormData: React.Dispatch<React.SetStateAction<System>>
    errors: SystemFormErrors
    setErrors: (errors: SystemFormErrors) => void
    devTeamViewList: string[]
    setDevTeamViewList: React.Dispatch<React.SetStateAction<string[]>>
}

const SystemForm = ({formData, setFormData, errors, setErrors, devTeamViewList, setDevTeamViewList}: SystemFormProps) => {
    const [inputSearch, setInputSearch] = useState<string>('')
    const [optionsOpen, setOptionsOpen] = useState<boolean>(false)
    const [userOptions, setUserOptions] = useState([])

    const searchUsers = async () => {
        try {
            const res = await UserService.searchOrListUsers('aluno', inputSearch, undefined, 'search')

            if (res.status !== 200) throw new Error(res.data?.message)

            setUserOptions(res.data.results ?? res.data)
            setOptionsOpen(true)
        } catch (error) {
            console.error(error)
        }
    }

    const removeUser = (userIndex: number) => {
        setFormData({...formData, dev_team: formData.dev_team.filter((_, index) => userIndex !== index)})
        setDevTeamViewList(devTeamViewList.filter((_, index) => userIndex !== index))
    }

    const addUser = (option: OptionProps<'id'>) => {
        if (!formData.dev_team.includes(option.id)) {
            setFormData({...formData, dev_team: [...formData.dev_team, option.id]})
            setDevTeamViewList([...devTeamViewList, option.title])
        }

        setOptionsOpen(false)
    }

    const addGroup = () => {
        setFormData(prev => ({...prev, groups: [...prev.groups, '']}))
    }

    return (
        <>
            <div className={styles.formGroup}>
                <CustomLabel title='Nome *'>
                    <CustomInput
                        type='text'
                        value={formData.name}
                        max={50}
                        error={errors.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value })
                        }}
                        onBlur={() => {
                            setErrors({ ...errors, name: validateMandatoryStringField(formData.name) })
                        }}
                    />
                </CustomLabel>
            </div>
            <div className={styles.formGroup}>
                <CustomLabel title='URL/Domínio do sistema *'>
                    <CustomInput
                        type='text'
                        value={formData.system_url}
                        max={255}
                        error={errors.system_url}
                        onChange={(e) => {
                            setFormData({ ...formData, system_url: e.target.value })
                        }}
                        onBlur={() => {
                            setErrors({ ...errors, system_url: validateMandatoryStringField(formData.system_url) })
                        }}
                    />
                </CustomLabel>
            </div>
            <div className={styles.formGroup}>
                <CustomLabel title='Secret Key *'>
                    <CustomInput
                        type='text'
                        value={formData.secret_key}
                        max={255}
                        error={errors.secret_key}
                        placeholder='Insira a SECRET_KEY que consta na configurações do projeto'
                        onChange={(e) => {
                            setFormData({ ...formData, secret_key: e.target.value })
                        }}
                        onBlur={() => {
                            setErrors({ ...errors, secret_key: validateMandatoryStringField(formData.secret_key) })
                        }}
                    />
                </CustomLabel>
            </div>
            <div className={styles.formGroup}>
                <CustomLabel title='Estado atual *'>
                    <CustomSelect
                        value={formData.current_state}
                        onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
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
                        value={formData.is_active ? 'Ativo' : 'Inativo'}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'Ativo' ? true : false })}
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
                    <div className={styles.devTeamContainer}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                    <tr className={styles.tr}>
                                        <th className={styles.th}>Alunos</th>
                                        <th className={styles.th}/>
                                    </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {
                                    devTeamViewList.map((option, index) => (
                                        <tr>
                                            <td className={styles.td}>{option}</td>
                                            <td className={styles.td}>
                                                <img src={x} className={styles.remove} alt="remover" onClick={() => removeUser(index)}/>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    {errors.dev_team ? <ErrorMessage message={errors.dev_team}/> : null}
                </div>
                <div className={styles.tableFormGroup}>
                    <h2 className={styles.h2}>Grupos de acesso *</h2>
                    <DynamicTable
                        itemTitle='Grupos'
                        items={formData.groups}
                        setItems={(newGroups) => setFormData((prev) => ({ ...prev, groups: newGroups }))}
                    />
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <CustomButton text='Cadastrar' type='submit'/>
            </div>
        </>
    )
}

export default SystemForm