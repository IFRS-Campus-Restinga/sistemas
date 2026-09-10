import styles from './CurriculumTable.module.css'
import tableStyles from '../../components/table/Table.module.css'
import { useEffect, useState } from 'react'
import type { CurriculumInterface } from '../../services/ppcService'
import CustomLabel from '../../components/customLabel/CustomLabel'
import SubjectService from '../../services/subjectService'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import PPCService from '../../services/ppcService'
import CustomSearch from '../../components/customSearch/CustomSearch'
import CustomOptions from '../../components/customOptions/CustomOptions'
import deleteIcon from '../../assets/delete-svgrepo-com.svg'
import clear from '../../assets/close-svgrepo-com.svg'
import CustomInput from '../../components/customInput/CustomInput'
import FormContainer from '../../components/formContainer/FormContainer'
import CustomLoading from '../../components/customLoading/CustomLoading'

interface Subject {
    name: string
    preRequisits: {id: string, code: string, name?: string}[]
}

interface SubjectOption {
    id: string
    name: string
}

interface PreReqOption {
    id: string
    code: string
    name: string
}

interface CurriculumTableProps {
  state?: string
  title: string
  period: number
  curriculum: CurriculumInterface[]
  setCurriculum: (curriculum: CurriculumInterface[]) => void
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
}

const textFields: (keyof CurriculumInterface)[] = [
    'subject_teach_workload',
    'subject_ext_workload',
    'subject_remote_workload',
    'weekly_periods'
];

const CurriculumTable = ({state, title, curriculum, setCurriculum, subjects, setSubjects, period}: CurriculumTableProps) => {
    const [subjectSearched, setSubjectSearched] = useState<boolean[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [preReqSearched, setPreReqSearched] = useState<boolean[]>([])
    // Campo de pesquisa de pré-requisitos por linha
    const [preReqSearch, setPreReqSearch] = useState<string[]>([])
    // Opções de disciplina
    const [subjectOptions, setSubjectOptions] = useState<SubjectOption[][]>([[]])
    // Opções de pré-requisitos
    const [preReqOptions, setPreReqOptions] = useState<PreReqOption[][]>([[]])

    const fetchPreRequisits = async (index: number) => {
        try {
            const res = await SubjectService.list(1, preReqSearch[index], 'id, name, code')

            setPreReqOptions((prev) => {
                const updated = [...prev]

                updated[index] = res.data.results.map((subj: any) => {
                    return {
                        id: subj.id,
                        code: subj.code,
                        name: `${subj.name} (${subj.code})`
                    }
                })

                return updated
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    const fetchSubjects = async (index: number) => {
        try {
            const searchTerm = subjects[index]?.name ?? ''
            const res = await SubjectService.list(1, searchTerm, 'id, name, code')

            setSubjectOptions((prev) => {
                const updated = [...prev]

                updated[index] = res.data.results.map((subj: any) => {
                    return {
                        id: subj.id,
                        name: `${subj.name} (${subj.code})`
                    }
                })

                return updated
            })

            setSubjectSearched((prev) => {
                const updated = [...prev]
                updated[index] = true
                return updated
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    const hydrateSubjectDetails = async (index: number, subjectId: string, selectedName: string) => {
        try {
            const res = await SubjectService.get(
                subjectId,
                'id, name, code, subject_teach_workload, subject_ext_workload, subject_remote_workload, weekly_periods, pre_requisits.id, pre_requisits.name, pre_requisits.code'
            )

            const subjectData = res.data
            const updatedCurriculum = [...curriculum]
            const selectedPreReqs = subjectData.pre_requisits ?? []
            const subjectDisplayName = subjectData.name && subjectData.code
                ? `${subjectData.name} (${subjectData.code})`
                : (subjectData.name ?? selectedName)

            updatedCurriculum[index] = {
                ...updatedCurriculum[index],
                subject: subjectData.id ?? subjectId,
                subject_teach_workload: subjectData.subject_teach_workload ?? '',
                subject_ext_workload: subjectData.subject_ext_workload ?? '',
                subject_remote_workload: subjectData.subject_remote_workload ?? '',
                weekly_periods: subjectData.weekly_periods ?? '',
                pre_requisits: selectedPreReqs.map((preReq: any) => preReq.id ?? preReq.subject ?? preReq)
            }
            setCurriculum(updatedCurriculum)

            const updatedSubjects = [...subjects]
            updatedSubjects[index] = {
                name: subjectDisplayName,
                preRequisits: selectedPreReqs.map((preReq: any) => ({
                    id: preReq.id,
                    code: preReq.code,
                    name: preReq.name,
                }))
            }
            setSubjects(updatedSubjects)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    const deleteSubject = async (index: number, subjectId: string) => {
        try {
            await PPCService.deleteSubject(state!, subjectId)

            const updatedCurriculum = curriculum.filter((_, i) => i !== index)
            setCurriculum(updatedCurriculum)

            const updatedSubjects = subjects.filter((_, i) => i !== index)
            setSubjects(updatedSubjects)

            toast.success('Disciplina removida com sucesso', {
                autoClose: 2000,
                position: 'bottom-center'
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    const deletePreReq = async (index: number, pIndex: number, subjectId: string, preReqId: string) => {
        try {
            await PPCService.deletePreReq(state!, subjectId, preReqId)

            const updatedCurriculum = curriculum
            updatedCurriculum[index].pre_requisits = curriculum[index].pre_requisits.filter((_, i) => i !== pIndex)
            setCurriculum(updatedCurriculum)

            const updatedSubjects = subjects
            updatedSubjects[index].preRequisits = subjects[index].preRequisits.filter((_, i) => i !== pIndex)

            toast.success('Pré requisito removido com sucesso', {
                autoClose: 2000,
                position: 'bottom-center'
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            }
        }
    }

    useEffect(() => {
        const initialSubjects = subjects.map((subject) => ({
            name: subject.name || "",
            preRequisits: subject.preRequisits.map(pr => pr) || []
        }));

        setSubjects(initialSubjects);

        const emptyOptionsArray = new Array(initialSubjects.length).fill([]);
        const emptySearchArray = new Array(initialSubjects.length).fill('');

        setSubjectOptions(emptyOptionsArray);
        setPreReqOptions(emptyOptionsArray);
        setPreReqSearch(emptySearchArray);
        setPreReqSearched(new Array(initialSubjects.length).fill(false));

        setIsLoading(false);
    }, []);

    return (
        <FormContainer title={`${title}º Período`} formTip={"Preencha os campos obrigatórios (*)\n\nUtilize o botão de '+' para incluir novas linhas na tabela\n\nUtilize a barra de pesquisa para buscar/vincular disciplinas\n\nOs campos de carga horária devem ser preenchidos como horas-aula"}>
            <div className={styles.formGroup}>
                <CustomLabel title='Grade Curricular *'>
                    {
                        isLoading ? (
                            <CustomLoading/>
                        ) : (
                            <div className={styles.tableContainer}>
                                <table className={tableStyles.table}>
                                    <thead className={tableStyles.thead}>
                                        <tr className={tableStyles.tr}>
                                            <th className={tableStyles.th} style={{maxWidth: '100px'}}>Disciplina *</th>
                                            <th className={tableStyles.th} style={{maxWidth: '35px'}}>Carga Hor. Ens. *</th>
                                            <th className={tableStyles.th} style={{maxWidth: '35px'}}>Carga Hor. Ext. *</th>
                                            <th className={tableStyles.th} style={{maxWidth: '35px'}}>Carga Hor. Remota *</th>
                                            <th className={tableStyles.th} style={{maxWidth: '35px'}}>Periodos Sem. *</th>
                                            {
                                                period > 1 ? (
                                                    <th className={tableStyles.th} style={{minWidth: '80px'}}>Pré requisitos</th>
                                                ) : null
                                            }
                                            <th className={tableStyles.thDualAction}/>
                                        </tr>
                                    </thead>
                                    <tbody className={tableStyles.tbody}>
                                        {curriculum.map((curriculumData, index) => {
                                            const selectedSubject = subjects[index] ?? { name: '', preRequisits: [] }
                                            const selectedPreReqs = selectedSubject.preRequisits ?? []

                                            return (
                                                <tr key={`${curriculumData.subject || 'new'}-${index}`} className={tableStyles.tr} style={{ transform: 'none' }}>
                                                    <td className={tableStyles.td} style={{ maxWidth: '100px' }}>
                                                        <div className={styles.searchContainer}>
                                                            <CustomSearch
                                                                value={selectedSubject.name}
                                                                onSearch={() => fetchSubjects(index)}
                                                                onBlur={() => {
                                                                    const updatedSubjectOptions = [...subjectOptions]
                                                                    updatedSubjectOptions[index] = []
                                                                    setSubjectOptions(updatedSubjectOptions)

                                                                    setSubjectSearched((prev) => {
                                                                        const next = [...prev]
                                                                        next[index] = false
                                                                        return next
                                                                    })
                                                                }}
                                                                setSearch={(param) => {
                                                                    const updated = [...subjects]
                                                                    updated[index] = {
                                                                        ...selectedSubject,
                                                                        name: param,
                                                                    }
                                                                    setSubjects(updated)

                                                                    if (param.trim() === '') {
                                                                        const updatedSubjectOptions = [...subjectOptions]
                                                                        updatedSubjectOptions[index] = []
                                                                        setSubjectOptions(updatedSubjectOptions)
                                                                        setSubjectSearched((prev) => {
                                                                            const next = [...prev]
                                                                            next[index] = false
                                                                            return next
                                                                        })
                                                                    }
                                                                }}
                                                            />
                                                            <CustomOptions
                                                                renderKey='name'
                                                                options={subjectOptions[index] ?? []}
                                                                searched={subjectSearched[index] ?? false}
                                                                onSelect={async (option) => {
                                                                    const alreadySelected = curriculum.some(
                                                                        (item, i) => i !== index && item.subject === option.id
                                                                    )

                                                                    if (alreadySelected) return

                                                                    const updated = [...subjects]
                                                                    updated[index] = {
                                                                        name: option.name,
                                                                        preRequisits: [],
                                                                    }
                                                                    setSubjects(updated)

                                                                    await hydrateSubjectDetails(index, option.id, option.name)

                                                                    const updatedSubjectOptions = [...subjectOptions]
                                                                    updatedSubjectOptions[index] = []
                                                                    setSubjectOptions(updatedSubjectOptions)

                                                                    const updatedSubjectSearched = [...subjectSearched]
                                                                    updatedSubjectSearched[index] = false
                                                                    setSubjectSearched(updatedSubjectSearched)
                                                                }}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td className={tableStyles.td} style={{ maxWidth: '35px' }}>
                                                        {curriculumData.subject_teach_workload || '—'}
                                                    </td>
                                                    <td className={tableStyles.td} style={{ maxWidth: '35px' }}>
                                                        {curriculumData.subject_ext_workload || '—'}
                                                    </td>
                                                    <td className={tableStyles.td} style={{ maxWidth: '35px' }}>
                                                        {curriculumData.subject_remote_workload || '—'}
                                                    </td>
                                                    <td className={tableStyles.td} style={{ maxWidth: '35px' }}>
                                                        {curriculumData.weekly_periods || '—'}
                                                    </td>
                                                    {period > 1 ? (
                                                        <td className={tableStyles.td} style={{ minWidth: '80px' }}>
                                                            {selectedPreReqs.length > 0 ? (
                                                                <div className={styles.preReqContainer}>
                                                                    {selectedPreReqs.map((preReq, pIndex) => (
                                                                        <div key={`${preReq.id || preReq.code || preReq.name || 'pr'}-${pIndex}`} className={styles.preReq}>
                                                                            {preReq.code || preReq.name || '—'}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </td>
                                                    ) : null}

                                                    <td className={tableStyles.tdDualAction}>
                                                        <img
                                                            src={curriculumData.id ? deleteIcon : clear}
                                                            className={tableStyles.action}
                                                            alt=""
                                                            onClick={() => {
                                                                if (curriculumData.id) {
                                                                    deleteSubject(index, curriculumData.subject)
                                                                } else {
                                                                    const updatedCurriculum = curriculum.filter((_, i) => i !== index)
                                                                    setCurriculum(updatedCurriculum)
                                                                }
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                    <button
                        className={styles.addButton}
                        type="button"
                        onClick={() => {
                            const updatedCurriculum = [
                                ...curriculum,
                                {
                                    subject: '',
                                    subject_teach_workload: '',
                                    subject_ext_workload: '',
                                    subject_remote_workload: '',
                                    weekly_periods: '',
                                    pre_requisits: [],
                                    period: period
                                }
                            ]

                            setCurriculum(updatedCurriculum);

                            setSubjects([...subjects, { name: '', preRequisits: [] }]);
                            setSubjectOptions([...subjectOptions, []]);
                            setPreReqOptions([...preReqOptions, []]);
                            setPreReqSearch([...preReqSearch, '']);
                            setPreReqSearched([...preReqSearched, false]);
                        }}
                    >
                        +
                    </button>
                </CustomLabel>
            </div>
        </FormContainer>
    )
}

export default CurriculumTable