import { useCallback, useEffect, useState } from 'react'
import PersonalAccountInfosService from '../../services/personalAccountInfosService'
import { useSetBindRequestsCount, useUser } from '../../store/userHooks'
import styles from './Profile.module.css'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLoading from '../../components/customLoading/CustomLoading'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomInput from '../../components/customInput/CustomInput'
import CustomButton from '../../components/customButton/CustomButton'
import Table from '../../components/table/tablesComponents/Table'
import BindRequestService, { type BindRequest } from '../../services/bindRequestService'
import { validateBirthDate, validateCPF, validatePhoneNumber, validateRegistration } from '../../utils/validations/generalValidations'
import visitorIcon from '../../assets/user-svgrepo-com.svg'
import studentIcon from '../../assets/user-graduate-svgrepo-com.svg'
import employeeIcon from '../../assets/user-suit-svgrepo-com.svg'

interface ProfileInterface { email: string; registration: string; cpf: string; telephone_number: string; birth_date: string }
interface ProfileErrors { cpf: string | null; telephone_number: string | null; birth_date: string | null; registration: string | null }

const bindRequestTranslations = {
	id: 'id',
	username: 'nome',
	email: 'email',
	access_profile: 'perfil de acesso'
}

const accessProfiles: Record<string, { label: string; icon: string }> = {
	aluno: { label: 'Aluno', icon: studentIcon },
	servidor: { label: 'Servidor', icon: employeeIcon },
	convidado: { label: 'Convidado', icon: visitorIcon }
}

const Profile = () => {
	const user = useUser()
	const setBindRequestsCount = useSetBindRequestsCount()
	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [activeTab, setActiveTab] = useState<'account' | 'bindRequests'>('account')
	const [bindRequests, setBindRequests] = useState<BindRequest[]>([])
	const [isLoadingBindRequests, setIsLoadingBindRequests] = useState(false)
	const [hasPendingPersonalInfoBindRequest, setHasPendingPersonalInfoBindRequest] = useState(false)
	const [bindRequestPage, setBindRequestPage] = useState(1)
	const [nextBindRequestPage, setNextBindRequestPage] = useState<number | null>(null)
	const [previousBindRequestPage, setPreviousBindRequestPage] = useState<number | null>(null)
	const [profileData, setProfileData] = useState<ProfileInterface>({ birth_date: '', cpf: '', email: '', registration: '', telephone_number: '' })
	const [errors, setErrors] = useState<ProfileErrors>({ birth_date: null, cpf: null, registration: null, telephone_number: null })
	const profile = user.access_profile ? accessProfiles[user.access_profile] : undefined
	const fetchBindRequests = useCallback(async (page: number) => {
		setIsLoadingBindRequests(true)
		try {
			const response = await BindRequestService.getRequests(page)
			setBindRequests(response.data.results)
			setBindRequestsCount(response.data.count)
			setNextBindRequestPage(response.data.next ? page + 1 : null)
			setPreviousBindRequestPage(response.data.previous ? page - 1 : null)
		} catch (error) {
			if (error instanceof AxiosError) toast.error(error.response?.data?.message ?? 'Não foi possível carregar as solicitações de vínculo.')
			else {
				console.error(error)
				toast.error('Não foi possível carregar as solicitações de vínculo.')
			}
		} finally {
			setIsLoadingBindRequests(false)
		}
	}, [setBindRequestsCount])

	useEffect(() => {
		if (activeTab === 'bindRequests' && user.id) {
			fetchBindRequests(bindRequestPage)
		}
	}, [activeTab, bindRequestPage, fetchBindRequests, user.id])

	const handleBindRequest = async (requestId: string, approve: boolean) => {
		try {
			const response = approve
				? await BindRequestService.approveRequest(requestId)
				: await BindRequestService.rejectRequest(requestId)
			toast.success(response.data.message)
			const nextPage = bindRequests.length === 1 && bindRequestPage > 1
				? bindRequestPage - 1
				: bindRequestPage
			if (nextPage === bindRequestPage) {
				await fetchBindRequests(nextPage)
			} else {
				setBindRequestPage(nextPage)
			}
		} catch (error) {
			if (error instanceof AxiosError) toast.error(error.response?.data?.message ?? 'Não foi possível processar a solicitação de vínculo.')
			else {
				console.error(error)
				toast.error('Não foi possível processar a solicitação de vínculo.')
			}
		}
	}

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const [res, pendingResponse] = await Promise.all([
					PersonalAccountInfosService.get(user.id!, 'user.email, personal_infos.cpf, personal_infos.birth_date, account_infos.registration, account_infos.telephone_number'),
					BindRequestService.getPendingRequest()
				])
				setProfileData({
					birth_date: res.data.personal_infos?.birth_date ?? '',
					cpf: res.data.personal_infos?.cpf ?? '',
					email: res.data.user.email,
					registration: res.data.account_infos?.registration ?? '',
					telephone_number: res.data.account_infos?.telephone_number ?? ''
				})
				setHasPendingPersonalInfoBindRequest(pendingResponse.data.pending)
			} catch (error) { if (error instanceof AxiosError) toast.error(error.response?.data.message); else console.error(error) }
			finally { setIsLoading(false) }
		}
		fetchProfile()
	}, [user.id])
	const validateProfile = () => {
		const nextErrors: ProfileErrors = {
			cpf: hasPendingPersonalInfoBindRequest ? null : validateCPF(profileData.cpf),
			telephone_number: validatePhoneNumber(profileData.telephone_number),
			birth_date: hasPendingPersonalInfoBindRequest ? null : validateBirthDate(profileData.birth_date),
			registration: user.access_profile === 'convidado' ? null : validateRegistration(profileData.registration, user.access_profile ?? '')
		}
		setErrors(nextErrors)
		return Object.values(nextErrors).every((error) => error === null)
	}

	const submitProfile = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!validateProfile() || !user.id) return

		setIsSaving(true)
		try {
			const response = await PersonalAccountInfosService.edit(user.id, {
				user: user.id,
				personal_infos: hasPendingPersonalInfoBindRequest ? {} : {
					cpf: profileData.cpf,
					birth_date: profileData.birth_date
				},
				account_infos: {
					registration: profileData.registration,
					telephone_number: profileData.telephone_number
				}
			})
			toast.success(response.data.message)
			const pendingResponse = await BindRequestService.getPendingRequest()
			setHasPendingPersonalInfoBindRequest(pendingResponse.data.pending)
		} catch (error) {
			if (error instanceof AxiosError) {
				const message = error.response?.data?.message
				if (Array.isArray(message)) message.forEach((item: string) => toast.error(item))
				else if (typeof message === 'string') toast.error(message)
				else toast.error('Não foi possível salvar as alterações.')
			} else {
				console.error(error)
				toast.error('Não foi possível salvar as alterações.')
			}
		} finally {
			setIsSaving(false)
		}
	}

	return <section className={styles.section}>
		<div className={styles.profileHeader}>
			<img src={localStorage.getItem('profilePicture')!} alt="" className={styles.profilePicture} />
			<div className={styles.identity}>
				<label className={styles.label}>Nome<h2 className={styles.h2}>{user.username}</h2></label>
				<label className={styles.label}>Email<h2 className={styles.h2}>{profileData.email}</h2></label>
				{profile ? <button type="button" className={styles.profileBadge} aria-label={`Perfil: ${profile.label}`}>
					<img src={profile.icon} alt="" className={styles.profileBadgeIcon} />
					<span>{profile.label}</span>
				</button> : null}
			</div>
		</div>
		<nav className={styles.tabs} aria-label="Minha conta">
			<button type="button" className={activeTab === 'account' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('account')}>Dados da conta</button>
			<button type="button" className={activeTab === 'bindRequests' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('bindRequests')}>Solicitações de vínculo</button>
		</nav>
		{activeTab === 'account' ? isLoading ? <div className={styles.accountContent}><CustomLoading /></div> : <div className={styles.accountContent}>
			<form className={styles.editForm} onSubmit={submitProfile}>
				<div className={styles.fieldsGrid}>
					{hasPendingPersonalInfoBindRequest ? <div className={styles.pendingBindCard} role="status">
						<strong>Vínculo de informações pessoais aguardando aprovação</strong>
						<span>O CPF e a data de nascimento ficarão disponíveis após a aprovação da solicitação.</span>
					</div> : <>
						<CustomLabel title="CPF">
							<CustomInput type="text" value={profileData.cpf} maxLength={11} onChange={(event) => setProfileData({ ...profileData, cpf: event.target.value.replace(/\D/g, '') })} onBlur={() => setErrors({ ...errors, cpf: validateCPF(profileData.cpf) })} error={errors.cpf} />
						</CustomLabel>
						<CustomLabel title="Data de nascimento">
							<CustomInput type="date" value={profileData.birth_date} onChange={(event) => setProfileData({ ...profileData, birth_date: event.target.value })} onBlur={() => setErrors({ ...errors, birth_date: validateBirthDate(profileData.birth_date) })} error={errors.birth_date} />
						</CustomLabel>
					</>}
					<CustomLabel title="Contato">
						<CustomInput type="tel" value={profileData.telephone_number} maxLength={13} onChange={(event) => setProfileData({ ...profileData, telephone_number: event.target.value })} onBlur={() => setErrors({ ...errors, telephone_number: validatePhoneNumber(profileData.telephone_number) })} error={errors.telephone_number} />
					</CustomLabel>
					{user.access_profile !== 'convidado' ? <CustomLabel title="Matrícula">
						<CustomInput type="text" value={profileData.registration} maxLength={10} onChange={(event) => setProfileData({ ...profileData, registration: event.target.value.replace(/\D/g, '') })} onBlur={() => setErrors({ ...errors, registration: validateRegistration(profileData.registration, user.access_profile ?? '') })} error={errors.registration} />
					</CustomLabel> : null}
				</div>
				<div className={styles.buttonContainer}>
					<CustomButton text={isSaving ? 'Salvando...' : 'Salvar alterações'} type="submit" disabled={isSaving} />
				</div>
			</form>
		</div> : <div className={styles.bindRequests}>
		{isLoadingBindRequests && bindRequests.length === 0 ? <CustomLoading /> : <Table
			current={bindRequestPage}
			fetchData={() => undefined}
			itemList={bindRequests}
			loadingContent={isLoadingBindRequests}
			next={nextBindRequestPage}
			previous={previousBindRequestPage}
			setCurrent={setBindRequestPage}
			dualActions={{
				onApprove: (request) => void handleBindRequest(request.id, true),
				onDecline: (requestId) => void handleBindRequest(requestId, false),
				canApprove: true,
				canDecline: true
			}}
			translations={bindRequestTranslations}
		/>}
	</div>}
	</section>
}

export default Profile
