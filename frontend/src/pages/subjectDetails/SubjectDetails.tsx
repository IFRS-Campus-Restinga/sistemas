import { useLocation } from 'react-router-dom'
import styles from './SubjectDetails.module.css'
import { useEffect, useState } from 'react'
import SubjectService, { type SubjectInterface } from '../../services/subjectService'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomLoading from '../../components/customLoading/CustomLoading'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomInput from '../../components/customInput/CustomInput'
import CustomTextArea from '../../components/customTextArea/CustomTextArea'

const SubjectDetails = () => {
	const { state } = useLocation()
	const [isLoading, setIsLoading] = useState(true)
	const [subject, setSubject] = useState<SubjectInterface>({ code: '', menu: '', name: '', objective: '', id: '', subject_teach_workload: '', subject_ext_workload: '', subject_remote_workload: '', weekly_periods: '', pre_requisits: [] })
	const fetchSubject = async () => {
		try { setSubject((await SubjectService.get(state, 'id, name, code, menu, objective')).data) }
		catch (error) { if (error instanceof AxiosError) toast.error(error.response?.data.message); else console.error(error) }
		finally { setIsLoading(false) }
	}
	useEffect(() => { state ? fetchSubject() : setIsLoading(false) }, [state])
	return <FormContainer title="Detalhes da Disciplina">
		{isLoading ? <CustomLoading /> : <section className={styles.section}>
			<div className={styles.sectionGroup}><CustomLabel title="Nome *"><CustomInput type="text" value={subject.name} onChange={() => {}} disabled /></CustomLabel><CustomLabel title="Código *"><CustomInput type="text" value={subject.code} onChange={() => {}} disabled /></CustomLabel></div>
			<div className={styles.sectionGroup}><CustomLabel title="Objetivo Geral *"><CustomTextArea value={subject.objective} onChange={() => {}} disabled /></CustomLabel></div>
			<div className={styles.sectionGroup}><CustomLabel title="Ementa *"><CustomTextArea value={subject.menu} onChange={() => {}} disabled /></CustomLabel></div>
		</section>}
	</FormContainer>
}

export default SubjectDetails
