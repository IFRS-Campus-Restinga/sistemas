import { useNavigate } from 'react-router-dom'
import styles from './ProfileForm.module.css'
import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import type { AdditionalInfosInterface } from '../../../../services/additionalInfoService'
import AdditionalInfoService from '../../../../services/additionalInfoService'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomButton from '../../../../components/customButton/CustomButton'
import { validateBirthDate, validateCPF, validatePhoneNumber, validateRegistration } from '../../../../utils/validations/generalValidations'
import { useUser } from '../../../../store/userHooks'

interface AdditionalInfosErrors {
    birth_date: string | null
    telephone_number: string | null
    registration: string | null
    cpf: string | null
}

const ProfileForm = () => {
    const redirect = useNavigate()
    const user = useUser()
    const [addInfoForm, setAddInfoForm] = useState<AdditionalInfosInterface>({
        id: '',
        birth_date: '',
        cpf: '',
        registration: '',   
        telephone_number: '',
        user: user.id ?? ''
    })
    const [addInfoErrors, setAddInfoErrors] = useState<AdditionalInfosErrors>({
        birth_date: null,
        cpf: null,
        registration: null,
        telephone_number: null
    })

    const validateAddInfoForm = () => {
        let errors: AdditionalInfosErrors = {
            birth_date: null,
            cpf: null,
            registration: null,
            telephone_number: null
        }

        for (let field in addInfoForm) {
            switch (field) {
                case 'cpf':
                    errors.cpf = validateCPF(addInfoForm.cpf)
                    break;
                case 'telephone_number':
                    errors.telephone_number = validatePhoneNumber(addInfoForm.telephone_number)
                    break;
                case 'birth_date':
                    errors.birth_date = validateBirthDate(addInfoForm.birth_date)
                    break;
                case 'registration':
                    if (user.access_profile !== 'convidado') {
                        errors.registration = validateRegistration(addInfoForm.registration, user.access_profile ?? "")
                    }
                    break;
                default:
                    break;
            }
        }

        setAddInfoErrors(errors)
        return Object.values(errors).every((error) => error === null)
    }

    const submitAddInfo = (e: React.FormEvent) => {
        e.preventDefault()

        console.log(validateAddInfoForm())
        
        if (validateAddInfoForm()) {
            toast.promise(
                AdditionalInfoService.create(addInfoForm),
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
                            redirect(`/session/user/home/`);
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
        if (!user.first_login) redirect('/session/user/home')
    }, [])

    return (
        <FormContainer title={"Dados adicionais"} formTip={"Preencha os campos obrigatórios (*)"} width='50%'>
            <form className={styles.form} onSubmit={submitAddInfo}>
                <div className={styles.formGroup}>
                    <CustomLabel title='CPF *'>
                        <CustomInput
                            type='text'
                            value={addInfoForm.cpf}
                            onChange={(e) => {
                                if (!isNaN(e.target.value)) setAddInfoForm({...addInfoForm, cpf: e.target.value})
                            }}
                            onBlur={() => setAddInfoErrors({...addInfoErrors, cpf: validateCPF(addInfoForm.cpf)})}
                            error={addInfoErrors.cpf}
                            disabled={!user.first_login!}
                        />
                    </CustomLabel>
                    <CustomLabel title='Contato *'>
                        <CustomInput
                            type='text'
                            value={addInfoForm.telephone_number}
                            onChange={(e) => {
                                if (!isNaN(e.target.value)) setAddInfoForm({...addInfoForm, telephone_number: e.target.value})
                            }}
                            onBlur={() => setAddInfoErrors({...addInfoErrors, telephone_number: validatePhoneNumber(addInfoForm.telephone_number)})}
                            error={addInfoErrors.telephone_number}
                            disabled={!user.first_login!}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <CustomLabel title='Data de nascimento *'>
                        <CustomInput
                            type='date'
                            value={addInfoForm.birth_date}
                            onChange={(e) => setAddInfoForm({...addInfoForm, birth_date: e.target.value})}
                            onBlur={() => setAddInfoErrors({...addInfoErrors, birth_date: validateBirthDate(addInfoForm.birth_date)})}
                            error={addInfoErrors.birth_date}
                            disabled={!user.first_login!}
                        />
                    </CustomLabel>
                    {
                        user.access_profile !== 'convidado' ? (
                            <CustomLabel title='Matrícula *'>
                                <CustomInput
                                    type='text'
                                    value={addInfoForm.registration}
                                    onChange={(e) => {
                                        if (!isNaN(e.target.value)) setAddInfoForm({...addInfoForm, registration: e.target.value})
                                    }}
                                    onBlur={() => setAddInfoErrors({...addInfoErrors, registration: validateRegistration(addInfoForm.registration, user.access_profile ?? "")})}
                                    error={addInfoErrors.registration}
                                    disabled={!user.first_login!}
                                />
                            </CustomLabel>
                        ) : null
                    }
                </div>
                <div className={styles.buttonContainer}>
                    <CustomButton text={'Cadastrar'} type='submit'/>
                </div>
            </form>
        </FormContainer>
    )

}

export default ProfileForm