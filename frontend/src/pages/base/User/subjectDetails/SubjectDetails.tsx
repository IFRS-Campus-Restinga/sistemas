import { useLocation } from 'react-router-dom'
import styles from './SubjectDetails.module.css'
import { useEffect, useState } from 'react'
import SubjectService, { type SubjectInterface } from '../../../../services/subjectService'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomTextArea from '../../../../components/customTextArea/CustomTextArea'

const SubjectDetails = () => {
    const location = useLocation()
    const { state } = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [subject, setSubject] = useState<SubjectInterface>({
        code: '',
        menu: '',
        name: '',
        objective: '',
        id: ''
    })

    const fetchSubject = async () => {
        try {
            const res = await SubjectService.get(state, 'id, name, code, menu, objective')

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

    useEffect(() => {        
        if (state) {
            fetchSubject()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <FormContainer title={'Detalhes da Disciplina'}>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <section className={styles.section}>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Nome *'>
                                <CustomInput
                                    type='text'
                                    value={subject.name}
                                    onChange={(_) =>  {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                            <CustomLabel title='Código *'>
                                <CustomInput
                                    type='text'
                                    value={subject.code}
                                    onChange={(_) =>  {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Objetivo Geral *'>
                                <CustomTextArea
                                    value={subject.objective}
                                    onChange={(_) =>  {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Ementa *'>
                                <CustomTextArea
                                    value={subject.menu}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                    </section>
                )
            }
        </FormContainer>
    )
}

export default SubjectDetails