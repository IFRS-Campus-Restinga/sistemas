import styles from './CurriculumTable.module.css'
import tableStyles from '../../components/table/Table.module.css'
import { useEffect, useState } from 'react'
import type { PPCSubjectInterface, SchoolPeriodInterface } from '../../services/ppcService'
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
    preRequists: string[]
}

interface ErrorsSubjectsForm {
    subject: string | null
    subject_teach_workload: string | null 
    subject_ext_workload: string | null
    subject_remote_workload: string | null
    weekly_periods: string | null
}

interface CurriculumTableProps {
  state?: string
  title: string
  period: SchoolPeriodInterface
  setPeriod: (curriculum: SchoolPeriodInterface) => void
  subjects: Subject[]
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
}

const CurriculumTable = ({state, title, period, setPeriod, subjects, setSubjects}: CurriculumTableProps) => {
    const [subjectSearched, setSubjectSearched] = useState<boolean[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [preReqSearched, setPreReqSearched] = useState<boolean[]>([])
    // Campo de pesquisa de pré-requisitos por linha
    const [preReqSearch, setPreReqSearch] = useState<string[]>([])
    // Opções de disciplina
    const [subjectOptions, setSubjectOptions] = useState<Array<[]>>([[]])
    // Opções de pré-requisitos
    const [preReqOptions, setPreReqOptions] = useState<Array<[]>>([[]])

    const [errors, setErrors] = useState<ErrorsSubjectsForm[]>([])

    const fetchPreRequisits = async (index: number) => {
        try {
            const res = await SubjectService.list(1, preReqSearch[index], 'search')

            setPreReqOptions((prev) => {
                const updated = [...prev]

                updated[index] = res.data.results

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
            const res = await SubjectService.list(1, subjects[index].name, 'search')

            setSubjectOptions((prev) => {
                const updated = [...prev]

                updated[index] = res.data.results

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

    const deleteSubject = async (index: number, subjectId: string) => {
        try {
            await PPCService.deleteSubject(state!, subjectId)

            setPPC({...PPC, subjects: PPC.subjects.filter((_, i) => i !== index)})
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
            name: subject.name,
            preRequists: subject.preRequists.map(pr => pr) || []
        }));

        setSubjects(initialSubjects);
        
        setSubjectOptions(initialSubjects.map(() => []));
        setPreReqOptions(initialSubjects.map(() => []));
        setPreReqSearch(initialSubjects.map(() => ''));
        setPreReqSearched(initialSubjects.map(() => false));

        setIsLoading(false)
    }, [period]);

    return (
        <FormContainer title={title} formTip={"Preencha os campos obrigatórios (*)\n\nUtilize o botão de '+' para incluir novas linhas na tabela\n\nUtilize a barra de pesquisa para buscar/vincular disciplinas"}>
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
                                            <th className={tableStyles.th} style={{minWidth: '80px'}}>Pré requisitos</th>
                                            <th className={tableStyles.thAction}/>
                                        </tr>
                                    </thead>
                                    <tbody className={tableStyles.tbody}>
                                        {
                                            period.curriculum.map((curriculumSubject, index) => (
                                                <tr className={tableStyles.tr} style={{transform: 'none'}}>
                                                    {
                                                        Object.entries(curriculumSubject).map(([key, value]) => {
                                                        if (key === 'id') return null

                                                        if (key === 'subject') {
                                                            return (
                                                                // Troca o id da disciplina pelo nome que está no state subjects[index].name
                                                            <td className={tableStyles.td} style={{ maxWidth: '100px' }}>
                                                                <div className={styles.searchContainer}>
                                                                    {/* Passa o nome para o campo de pesquisa */}
                                                                    <CustomSearch
                                                                        value={subjects[index].name}
                                                                        onSearch={() => fetchSubjects(index)}
                                                                        setSearch={(param) => {
                                                                            setSubjects((prev) => {
                                                                                const updated = [...prev]

                                                                                updated[index].name = param

                                                                                return updated
                                                                            })
                                                                        }}
                                                                    />
                                                                    <CustomOptions
                                                                        options={subjectOptions[index]}
                                                                        searched={subjectSearched[index]}
                                                                        onSelect={(option) => {
                                                                            const updatedCurriculum = [...period.curriculum];
                                                                                updatedCurriculum[index] = {
                                                                                ...updatedCurriculum[index],
                                                                                subject: option.id
                                                                            };

                                                                            setPeriod({
                                                                                ...period,
                                                                                curriculum: updatedCurriculum
                                                                            })
                                                                            
                                                                            // atualizações auxiliares
                                                                            setSubjects((prev) => {
                                                                            const updated = [...prev];
                                                                            updated[index].name = option.title;
                                                                            return updated;
                                                                            });

                                                                            setSubjectOptions((prev) => {
                                                                            const updated = [...prev];
                                                                            updated[index] = [];
                                                                            return updated;
                                                                            });

                                                                            setSubjectSearched((prev) => {
                                                                            const updated = [...prev];
                                                                            updated[index] = false;
                                                                            return updated;
                                                                            });
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                            )
                                                        }

                                                        if (key === 'pre_requisits') {
                                                            return (
                                                                <td className={tableStyles.td} style={{ maxWidth: '80px' }}>
                                                                    <div className={styles.searchContainer}>
                                                                        <CustomSearch
                                                                            value={preReqSearch[index]}
                                                                            onSearch={() => fetchPreRequisits(index)}
                                                                            setSearch={(param) => {
                                                                                setPreReqSearch((prev) => {
                                                                                    const updated = [...prev]

                                                                                    updated[index] = param

                                                                                    return updated
                                                                                })
                                                                            }}
                                                                        />
                                                                        <CustomOptions
                                                                            options={preReqOptions[index]}
                                                                            searched={preReqSearched[index]}
                                                                            onSelect={(option) => {
                                                                                // Atualiza subjects (usado para exibir os nomes na UI)
                                                                                setSubjects((prev) => {
                                                                                    const updated = [...prev]
                                                                                    const subject = { ...updated[index] }

                                                                                    subject.preRequists = [...(subject.preRequists || []), option.extraField!]
                                                                                    updated[index] = subject

                                                                                    return updated
                                                                                })

                                                                                const updatedCurriculum = [...period.curriculum];
                                                                                const subject = { ...updatedCurriculum[index] };

                                                                                const currentPreReqs = subject.pre_requisits ?? [];

                                                                                const alreadyAdded = currentPreReqs.some(pr => pr.id === option.id);
                                                                                if (alreadyAdded) return; // ou um toast

                                                                                subject.pre_requisits = [...currentPreReqs, { id: option.id }];
                                                                                updatedCurriculum[index] = subject;

                                                                                // Chama setPeriod passando somente o curriculum atualizado
                                                                                setPeriod({
                                                                                    ...period,
                                                                                    curriculum: updatedCurriculum
                                                                                })

                                                                                // Limpa opções e estado de busca
                                                                                setPreReqOptions((prev) => {
                                                                                const updated = [...prev]
                                                                                updated[index] = []
                                                                                return updated
                                                                                })

                                                                                setPreReqSearched((prev) => {
                                                                                const updated = [...prev]
                                                                                updated[index] = false
                                                                                return updated
                                                                                })

                                                                                setPreReqSearch((prev) => {
                                                                                const updated = [...prev]
                                                                                updated[index] = ''
                                                                                return updated
                                                                                })
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    {
                                                                        curriculumSubject.pre_requisits.map((preReq, pIndex) => (
                                                                            <div key={pIndex} className={styles.preReq}>
                                                                                {subjects[index].preRequists[pIndex]}
                                                                                <img 
                                                                                src={preReq.ppcsubject ? deleteIcon : clear} 
                                                                                className={tableStyles.action} 
                                                                                alt=""
                                                                                onClick={() => {
                                                                                    if (preReq.ppcsubject) {
                                                                                        deletePreReq(index, pIndex, curriculumSubject.subject, preReq.id)
                                                                                    } else {
                                                                                        // Atualiza visual dos nomes dos pré-requisitos
                                                                                        setSubjects((prev) => {
                                                                                            const updated = [...prev]
                                                                                            const subject = { ...updated[index] }

                                                                                            subject.preRequists = subject.preRequists.filter((_, i) => i !== pIndex)
                                                                                            updated[index] = subject

                                                                                            return updated
                                                                                        })

                                                                                        const updatedCurriculum = [...period.curriculum]
                                                                                        const updatedSubject = { ...updatedCurriculum[index] }

                                                                                        updatedSubject.pre_requisits = updatedSubject.pre_requisits.filter((_, i) => i !== pIndex)
                                                                                        updatedCurriculum[index] = updatedSubject

                                                                                        // Atualiza o estado de period.curriculum (removendo o pré-requisito)
                                                                                        setPeriod({
                                                                                            ...period,
                                                                                            curriculum: updatedCurriculum
                                                                                        })
                                                                                    }
                                                                                }}
                                                                                />
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </td>
                                                            )
                                                        }
                                                        return (
                                                            <td className={tableStyles.td} style={{ maxWidth: '35px' }}>
                                                                <CustomInput
                                                                    type="text"
                                                                    value={period.curriculum[index][key as keyof PPCSubjectInterface] ?? ''}
                                                                    onChange={(e) => {
                                                                        const inputValue = e.target.value;
                                                                        const isNumeric = !isNaN(Number(inputValue));

                                                                        if (isNumeric) {
                                                                            const updatedCurriculum = [...period.curriculum];
                                                                            const updatedSubject = { ...updatedCurriculum[index] };

                                                                            updatedSubject[key as keyof PPCSubjectInterface] = inputValue;
                                                                            updatedCurriculum[index] = updatedSubject;

                                                                            setPeriod({
                                                                                ...period,
                                                                                curriculum: updatedCurriculum
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                        )
                                                    })}
                                                <td className={tableStyles.tdAction}>
                                                    <img 
                                                        src={curriculumSubject.id ? deleteIcon : clear} 
                                                        className={tableStyles.action} 
                                                        alt=""
                                                        onClick={() => {
                                                            if (curriculumSubject.id) {
                                                                deleteSubject(index, curriculumSubject.id)
                                                            } else {
                                                                const updatedCurriculum = period.curriculum.filter((_, i) => i !== index)

                                                                setPeriod({
                                                                    ...period,
                                                                    curriculum: updatedCurriculum
                                                                })

                                                                setSubjects(prev => prev.filter((_, i) => i !== index))
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                            ))
                                        }
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
                                ...period.curriculum,
                                {
                                    subject: '',
                                    subject_ext_workload: '',
                                    subject_remote_workload: '',
                                    subject_teach_workload: '',
                                    weekly_periods: '',
                                    pre_requisits: [],
                                }
                            ]

                            setPeriod({
                                ...period,
                                curriculum: updatedCurriculum
                            })

                            setPreReqOptions([...preReqOptions, []])
                            setSubjectOptions([...subjectOptions, []])
                            setSubjects([...subjects, {name: '', preRequists: []}])
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