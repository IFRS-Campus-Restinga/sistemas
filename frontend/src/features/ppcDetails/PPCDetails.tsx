import { useEffect, useState } from 'react'
import styles from './PPCDetails.module.css'
import tableStyles from '../../components/table/Table.module.css'
import { useLocation } from 'react-router-dom'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomLabel from '../../components/customLabel/CustomLabel'
import CustomInput from '../../components/customInput/CustomInput'
import PPCService from '../../services/ppcService'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLoading from '../../components/customLoading/CustomLoading'
import SubjectService, {type SubjectInterface} from '../../services/subjectService'
import Modal from '../../components/modal/Modal'
import CustomTextArea from '../../components/customTextArea/CustomTextArea'

interface CurriculumSubject {
    id: string
    name: string
}

interface CurriculumInterface {
    subject: CurriculumSubject
    subject_teach_workload: string;
    subject_remote_workload: string;
    subject_ext_workload: string;
    weekly_periods: string
    period: string;
    pre_requisits: { id: string; code: string }[];
}

interface GroupedSubject {
    id: string;
    name: string;
    subject_teach_workload: string;
    subject_remote_workload: string;
    subject_ext_workload: string;
    weekly_periods: string
    preRequisits: { id: string; code: string }[];
}

interface GroupedPeriod {
    period: string;
    subjects: GroupedSubject[];
}

interface PPCInterface {
    title: string
    course: string
    curriculum: GroupedPeriod[]
}

export function groupSubjectDatabyPeriod(curriculum: CurriculumInterface[]): GroupedPeriod[] {
  const grouped: Record<string, GroupedSubject[]> = {};

  curriculum.forEach((item) => {
    const period = item.period;

    if (!grouped[period]) {
      grouped[period] = [];
    }

    grouped[period].push({
      id: item.subject.id,
      name: item.subject.name,
      subject_teach_workload: item.subject_teach_workload,
      subject_remote_workload: item.subject_remote_workload,
      subject_ext_workload: item.subject_ext_workload,
      weekly_periods: item.weekly_periods,
      preRequisits: item.pre_requisits || []
    });
  });

  return Object.keys(grouped).map((period) => ({
    period,
    subjects: grouped[period]
  }));
}

const PPCDetails = () => {
    const location = useLocation()
    const { state } = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [subject, setSubject] = useState<SubjectInterface | null>(null)
    const [PPC, setPPC] = useState<PPCInterface>({
        title: '',
        course: '',
        curriculum: []
    })

    const fetchPPC = async () => {
        try {
            const res = await PPCService.get(
                state, 
                `
                    title,
                    course.name,
                    curriculum.subject.id,
                    curriculum.subject.name,
                    curriculum.subject_teach_workload,
                    curriculum.subject_remote_workload,
                    curriculum.subject_ext_workload,
                    curriculum.weekly_periods,
                    curriculum.period,
                    curriculum.pre_requisits.id,
                    curriculum.pre_requisits.code,
                `
            )

            setPPC({
                title: res.data.title,
                course: res.data.course.name,
                curriculum: groupSubjectDatabyPeriod(res.data.curriculum)
            })
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

    const fetchSubject = async (subjId: string) => {
        try {
            const res = await SubjectService.get(subjId, 'name, code, menu, objective')

            setSubject(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
            }
        }
    }

    useEffect(() => {
        fetchPPC()
    }, [state])

    return (
        <FormContainer title='Detalhes Proj. Pedag. Curso'>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <section className={styles.section}>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Título'>
                                <CustomInput
                                    type='text'
                                    value={PPC.title}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                            <CustomLabel title='Curso'>
                                <CustomInput
                                    type='text'
                                    value={PPC.course}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <section className={styles.curriculumSection}>
                            {
                                PPC.curriculum.map((curriculum) => (
                                    <div className={styles.periodContainer}>
                                        <h2 className={styles.periodTitle}>
                                            {curriculum.period}º Período
                                        </h2>
                                        <div className={styles.curriculumContainer}>
                                            <table className={tableStyles.table}>
                                                <thead className={tableStyles.thead}>
                                                    <tr className={tableStyles.tr}>
                                                    <th className={tableStyles.th}>Disciplina</th>
                                                    <th className={tableStyles.th}>Carga Hor. Ens.</th>
                                                    <th className={tableStyles.th}>Carga Hor. Ext.</th>
                                                    <th className={tableStyles.th}>Carga Hor. Remota</th>
                                                    <th className={tableStyles.th}>Periodos Sem.</th>
                                                    {
                                                        Number(curriculum.period[0]) > 1 ? (
                                                            <th className={tableStyles.th}>Pré requisitos</th>
                                                        ) : null
                                                    }
                                                    <th className={tableStyles.thDynamicAction}/>
                                                </tr>
                                                </thead>
                                                <tbody className={tableStyles.tbody}>
                                                    {
                                                        curriculum.subjects.map((subject) => (
                                                            <tr className={tableStyles.tr}>
                                                                <td className={tableStyles.td}>
                                                                    <span className={styles.subjectContainer}>
                                                                        <p className={styles.subjectName}>
                                                                            {subject.name}
                                                                        </p>
                                                                        <button className={styles.detailsIcon} onClick={() => fetchSubject(subject.id)}>?</button>
                                                                    </span>
                                                                </td>
                                                                <td className={tableStyles.td}>{subject.subject_teach_workload}</td>
                                                                <td className={tableStyles.td}>{subject.subject_ext_workload}</td>
                                                                <td className={tableStyles.td}>{subject.subject_remote_workload}</td>
                                                                <td className={tableStyles.td}>{subject.weekly_periods}</td>
                                                                <td className={tableStyles.td}>
                                                                    {
                                                                        subject.preRequisits.length > 0 ? (
                                                                            <div className={styles.preReqsContainer}>
                                                                                {
                                                                                    subject.preRequisits.map((preReq) => (
                                                                                        <span className={styles.preReqContainer}>
                                                                                            {preReq.code}
                                                                                            <button className={styles.detailsIcon} onClick={() => fetchSubject(preReq.id)}>?</button>    
                                                                                        </span>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        ) : null
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            }
                        </section>
                    </section>
                )
            }
            {
                subject ? (
                    <Modal 
                        setIsOpen={(isOpen) => {
                            if (!isOpen) {
                                setSubject(null)
                            }
                        }}
                    >
                        <FormContainer title={'Detalhes da Disciplina'}>
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
                        </FormContainer>
                    </Modal>
                ) : null
            }
        </FormContainer>
    )
}

export default PPCDetails