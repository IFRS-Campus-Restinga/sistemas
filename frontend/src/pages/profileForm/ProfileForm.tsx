import { useLocation, useNavigate } from 'react-router-dom'
import styles from './ProfileForm.module.css'
import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import type { PersonalAccountInfosData } from '../../services/personalAccountInfosService'
import PersonalAccountInfosService from '../../services/personalAccountInfosService'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomInput from '../../components/customInput/CustomInput'
import CustomButton from '../../components/customButton/CustomButton'
import { validateBirthDate, validateCPF, validatePhoneNumber, validateRegistration } from '../../utils/validations/generalValidations'
import { useUser } from '../../store/userHooks'

interface PersonalAccountInfosErrors { birth_date: string | null; telephone_number: string | null; registration: string | null; cpf: string | null }

const ProfileForm = () => {
	const redirect = useNavigate()
	const location = useLocation()
	const user = useUser()
	const homePath = '/session/home/'
	const [infosForm, setInfosForm] = useState<PersonalAccountInfosData>({
		personal_infos: { birth_date: '', cpf: '' },
		account_infos: { registration: '', telephone_number: '' },
		user: user.id ?? ''
	})
	const [infosErrors, setInfosErrors] = useState<PersonalAccountInfosErrors>({ birth_date: null, cpf: null, registration: null, telephone_number: null })

	const validateInfosForm = () => {
		const errors: PersonalAccountInfosErrors = { birth_date: null, cpf: null, registration: null, telephone_number: null }
		errors.cpf = validateCPF(infosForm.personal_infos.cpf)
		errors.telephone_number = validatePhoneNumber(infosForm.account_infos.telephone_number)
		errors.birth_date = validateBirthDate(infosForm.personal_infos.birth_date)
		if (user.access_profile !== 'convidado') errors.registration = validateRegistration(infosForm.account_infos.registration, user.access_profile ?? '')
		setInfosErrors(errors)
		return Object.values(errors).every((error) => error === null)
	}

	const submitInfos = (e: React.FormEvent) => {
		e.preventDefault()
		if (!validateInfosForm()) return
		toast.promise(PersonalAccountInfosService.create(infosForm), { pending: 'Salvando alterações...', success: { render: ({ data }) => data.data.message }, error: 'Erro de validação' })
			.then((res) => { if (res.status === 201 || res.status === 200) setTimeout(() => redirect(homePath), 2000) })
			.catch((error) => { if (error instanceof AxiosError) { const errors = error.response?.data?.message; Array.isArray(errors) ? errors.forEach((message: string) => toast.error(message)) : toast.error(errors) } })
	}

	useEffect(() => { if (!user.first_login) redirect(homePath) }, [homePath, redirect, user.first_login])

	return <FormContainer title="Dados pessoais e da conta" formTip="Preencha os campos obrigatórios (*)" width="50%">
		<form className={styles.form} onSubmit={submitInfos}>
			<div className={styles.formGroup}><CustomLabel title="CPF *"><CustomInput type="text" value={infosForm.personal_infos.cpf} onChange={(e) => { if (!isNaN(e.target.value)) setInfosForm({ ...infosForm, personal_infos: { ...infosForm.personal_infos, cpf: e.target.value } }) }} onBlur={() => setInfosErrors({ ...infosErrors, cpf: validateCPF(infosForm.personal_infos.cpf) })} error={infosErrors.cpf} disabled={!user.first_login!} /></CustomLabel><CustomLabel title="Contato *"><CustomInput type="text" value={infosForm.account_infos.telephone_number} onChange={(e) => { if (!isNaN(e.target.value)) setInfosForm({ ...infosForm, account_infos: { ...infosForm.account_infos, telephone_number: e.target.value } }) }} onBlur={() => setInfosErrors({ ...infosErrors, telephone_number: validatePhoneNumber(infosForm.account_infos.telephone_number) })} error={infosErrors.telephone_number} disabled={!user.first_login!} /></CustomLabel></div>
			<div className={styles.formGroup}><CustomLabel title="Data de nascimento *"><CustomInput type="date" value={infosForm.personal_infos.birth_date} onChange={(e) => setInfosForm({ ...infosForm, personal_infos: { ...infosForm.personal_infos, birth_date: e.target.value } })} onBlur={() => setInfosErrors({ ...infosErrors, birth_date: validateBirthDate(infosForm.personal_infos.birth_date) })} error={infosErrors.birth_date} disabled={!user.first_login!} /></CustomLabel>{user.access_profile !== 'convidado' ? <CustomLabel title="Matrícula *"><CustomInput type="text" value={infosForm.account_infos.registration} onChange={(e) => { if (!isNaN(e.target.value)) setInfosForm({ ...infosForm, account_infos: { ...infosForm.account_infos, registration: e.target.value } }) }} onBlur={() => setInfosErrors({ ...infosErrors, registration: validateRegistration(infosForm.account_infos.registration, user.access_profile ?? '') })} error={infosErrors.registration} disabled={!user.first_login!} /></CustomLabel> : null}</div>
			<div className={styles.buttonContainer}><CustomButton text="Cadastrar" type="submit" /></div>
		</form>
	</FormContainer>
}

export default ProfileForm
