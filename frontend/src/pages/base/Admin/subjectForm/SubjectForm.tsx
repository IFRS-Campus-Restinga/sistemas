import { useLocation } from 'react-router-dom'
import styles from './SubjectForm.module.css'
import { useEffect, useState } from 'react'
import SubjectService, { type SubjectInterface } from '../../../../services/subjectService'
import { toast, ToastContainer } from 'react-toastify'
import { AxiosError } from 'axios'
import { validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomButton from '../../../../components/customButton/CustomButton'
import CustomTextArea from '../../../../components/customTextArea/CustomTextArea'

interface ErrorSubjectForm {
    name: string | null
    objective: string | null
    menu: string | null
    shortname: string | null
}

const SubjectForm = () => {
    const location = useLocation()
    const {state} = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [subject, setSubject] = useState<SubjectInterface>({
        menu: '',
        name: '',
        objective: '',
        shortname: ''
    })
    const [errors, setErrors] = useState<ErrorSubjectForm>({
        menu: null,
        name: null,
        objective: null,
        shortname: null
    })

    const fetchSubject = async () => {
        try {
            const res = await SubjectService.get(state)

            setSubject(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message, 
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            } else {
                console.error(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const validateForm = () => {
        let newErrors: ErrorSubjectForm = {
            name: null,
            menu: null,
            objective: null,
            shortname: null
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
                case 'shortname':
                    newErrors.shortname = validateMandatoryStringField(subject.shortname)
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
                (state ? SubjectService.edit(state, subject) : SubjectService.create(subject)),
                {
                    pending: state ? 'Salvando alterações...' : 'Cadastrando disciplina...',
                    success: state ? 'Alterações salvas com sucesso' : 'Disciplina cadastrada com sucesso',
                    error: {
                        render({ data }: { data: any }) {
                            return data?.message || 'Erro ao alterar dados'
                        }
                    }
                },
                {
                    autoClose: 2000,
                    position: 'bottom-center'
                }
            )
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
            <ToastContainer/>
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
                            <CustomLabel title='Sigla *'>
                                <CustomInput
                                    type='text'
                                    maxLength={7}
                                    value={subject.shortname}
                                    onChange={(e) =>  setSubject({...subject, shortname: e.target.value})}
                                    onBlur={() => setErrors({...errors, shortname: validateMandatoryStringField(subject.shortname)})}
                                    error={errors.shortname}
                                />
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