import { useLocation, useNavigate } from 'react-router-dom'
import styles from './SubjectForm.module.css'
import { useEffect, useState } from 'react'
import SubjectService, { type SubjectInterface } from '../../../../services/subjectService'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomButton from '../../../../components/customButton/CustomButton'
import CustomTextArea from '../../../../components/customTextArea/CustomTextArea'
import CustomSearch from '../../../../components/customSearch/CustomSearch'
import CustomOptions, { type OptionProps } from '../../../../components/customOptions/CustomOptions'
import deleteIcon from '../../../../assets/delete-svgrepo-com.svg'

interface ErrorSubjectForm {
    name: string | null
    objective: string | null
    menu: string | null
    code: string | null
    subject_teach_workload: string | null
    subject_ext_workload: string | null
    subject_remote_workload: string | null
    weekly_periods: string | null
}

const SubjectForm = () => {
    const location = useLocation()
    const {state} = location
    const redirect = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [subject, setSubject] = useState<SubjectInterface>({
        menu: '',
        name: '',
        objective: '',
        code: '',
        subject_teach_workload: '',
        subject_ext_workload: '',
        subject_remote_workload: '',
        weekly_periods: '',
        pre_requisits: []
    })
    const [errors, setErrors] = useState<ErrorSubjectForm>({
        menu: null,
        name: null,
        objective: null,
        code: null,
        subject_teach_workload: null,
        subject_ext_workload: null,
        subject_remote_workload: null,
        weekly_periods: null
    })
    const [preReqSearch, setPreReqSearch] = useState('')
    const [preReqOptions, setPreReqOptions] = useState<OptionProps<'name'>[]>([])
    const [preReqSearched, setPreReqSearched] = useState(false)

    const fetchSubject = async () => {
        try {
            const res = await SubjectService.get(state, 'id, name, code, menu, objective, subject_teach_workload, subject_ext_workload, subject_remote_workload, weekly_periods, pre_requisits.id, pre_requisits.name, pre_requisits.code')

            setSubject(res.data)
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

    const searchPreRequisits = async () => {
        try {
            const res = await SubjectService.list(1, preReqSearch, 'id, name, code')
            const selectedIds = subject.pre_requisits.map((preReq) => typeof preReq === 'string' ? preReq : preReq.id)
            setPreReqOptions(res.data.results.filter((option: OptionProps<'name'>) => (
                option.id !== subject.id && !selectedIds.includes(option.id)
            )))
            setPreReqSearched(true)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            }
        }
    }

    const addPreRequisit = (option: OptionProps<'name'>) => {
        setSubject((current) => ({
            ...current,
            pre_requisits: [...current.pre_requisits, option]
        }))
        setPreReqSearch('')
        setPreReqOptions([])
        setPreReqSearched(false)
    }

    const removePreRequisit = (id: string) => {
        setSubject((current) => ({
            ...current,
            pre_requisits: current.pre_requisits.filter((preReq) => (
                typeof preReq === 'string' ? preReq !== id : preReq.id !== id
            ))
        }))
    }

    const validateForm = () => {
        let newErrors: ErrorSubjectForm = {
            name: null,
            menu: null,
            objective: null,
            code: null,
            subject_teach_workload: null,
            subject_ext_workload: null,
            subject_remote_workload: null,
            weekly_periods: null
        }

        for (const field of ['subject_teach_workload', 'subject_ext_workload', 'subject_remote_workload', 'weekly_periods'] as const) {
            const value = subject[field]
            newErrors[field] = value === '' || value === null || value === undefined || Number.isNaN(Number(value)) || Number(value) < 0
                ? 'Informe um valor numérico válido'
                : null
        }

        for (let field in subject) {
            switch (field) {
                case 'name':
                    newErrors.name = validateMandatoryStringField(subject.name)
                    break;
                case 'menu':
                    newErrors.menu = validateMandatoryStringField(subject.menu)
                    break;
                case 'objective':
                    newErrors.objective = validateMandatoryStringField(subject.objective)
                    break;
                case 'code':
                    newErrors.code = validateMandatoryStringField(subject.code)
                    break;
                default:
                    break;
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).every((error) => error === null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            toast.promise(
                (state
                    ? SubjectService.edit(state, {...subject, pre_requisits: subject.pre_requisits.map((preReq) => typeof preReq === 'string' ? preReq : preReq.id)})
                    : SubjectService.create({...subject, pre_requisits: subject.pre_requisits.map((preReq) => typeof preReq === 'string' ? preReq : preReq.id)})),
                {
                    pending: state ? 'Salvando alterações...' : 'Cadastrando disciplina...',
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
                            redirect(`/session/admin/disciplinas/`);
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
            fetchSubject()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <FormContainer title={state ? 'Editar Disciplina' : 'Cadastrar Disciplina'} formTip={"Preencha os campos obrigatórios (*)"}>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Nome *'>
                                <CustomInput
                                    type='text'
                                    maxLength={100}
                                    value={subject.name}
                                    onChange={(e) =>  setSubject({...subject, name: e.target.value})}
                                    onBlur={() => setErrors({...errors, name: validateMandatoryStringField(subject.name)})}
                                    error={errors.name}
                                />
                            </CustomLabel>
                            <CustomLabel title='Código *'>
                                <CustomInput
                                    type='text'
                                    maxLength={15}
                                    value={subject.code}
                                    onChange={(e) =>  setSubject({...subject, code: e.target.value})}
                                    onBlur={() => setErrors({...errors, code: validateMandatoryStringField(subject.code)})}
                                    error={errors.code}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Carga horária de ensino *'>
                                <CustomInput type='number' min='0' value={String(subject.subject_teach_workload)} onChange={(e) => setSubject({...subject, subject_teach_workload: e.target.value})} error={errors.subject_teach_workload}/>
                            </CustomLabel>
                            <CustomLabel title='Carga horária de extensão *'>
                                <CustomInput type='number' min='0' value={String(subject.subject_ext_workload)} onChange={(e) => setSubject({...subject, subject_ext_workload: e.target.value})} error={errors.subject_ext_workload}/>
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Carga horária remota *'>
                                <CustomInput type='number' min='0' value={String(subject.subject_remote_workload)} onChange={(e) => setSubject({...subject, subject_remote_workload: e.target.value})} error={errors.subject_remote_workload}/>
                            </CustomLabel>
                            <CustomLabel title='Períodos semanais *'>
                                <CustomInput type='number' min='0' value={String(subject.weekly_periods)} onChange={(e) => setSubject({...subject, weekly_periods: e.target.value})} error={errors.weekly_periods}/>
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Objetivo Geral *'>
                                <CustomTextArea
                                    value={subject.objective}
                                    onChange={(e) =>  setSubject({...subject, objective: e.target.value})}
                                    onBlur={() => setErrors({...errors, objective: validateMandatoryStringField(subject.objective)})}
                                    error={errors.objective}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Pré-requisitos'>
                                <div className={styles.searchContainer}>
                                    <CustomSearch
                                        value={preReqSearch}
                                        onSearch={searchPreRequisits}
                                        onBlur={() => {
                                            setPreReqOptions([])
                                            setPreReqSearched(false)
                                        }}
                                        setSearch={(value) => {
                                            setPreReqSearch(value)
                                            if (!value.trim()) {
                                                setPreReqOptions([])
                                                setPreReqSearched(false)
                                            }
                                        }}
                                        showClear
                                    />
                                    <CustomOptions
                                        renderKey='name'
                                        options={preReqOptions}
                                        searched={preReqSearched}
                                        onSelect={addPreRequisit}
                                    />
                                    <div className={styles.preReqContainer}>
                                        {subject.pre_requisits.map((preReq) => {
                                            const id = typeof preReq === 'string' ? preReq : preReq.id
                                            const label = typeof preReq === 'string' ? preReq : `${preReq.name} (${preReq.code})`
                                            return <span key={id} className={styles.preReq}>
                                                {label}
                                                <img src={deleteIcon} alt='Remover pré-requisito' onClick={() => removePreRequisit(id)} />
                                            </span>
                                        })}
                                    </div>
                                </div>
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Ementa *'>
                                <CustomTextArea
                                    value={subject.menu}
                                    onChange={(e) =>  setSubject({...subject, menu: e.target.value})}
                                    onBlur={() => setErrors({...errors, menu: validateMandatoryStringField(subject.menu)})}
                                    error={errors.menu}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.buttonContainer}>
                            <CustomButton text={state ? "Salvar alterações" : "Cadastrar"} type='submit' />
                        </div>
                    </form>
                )
            }
        </FormContainer>
    )
}

export default SubjectForm