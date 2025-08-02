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
    preRequisits: string[]
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

const textFields: Array<keyof CurriculumInterface> = [
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
    const [subjectOptions, setSubjectOptions] = useState([[]])
    // Opções de pré-requisitos
    const [preReqOptions, setPreReqOptions] = useState([[]])

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

            // setPPC({...PPC, subjects: PPC.subjects.filter((_, i) => i !== index)})
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
        <FormContainer title={title} formTip={"Preencha os campos obrigatórios (*)\n\nUtilize o botão de '+' para incluir novas linhas na tabela\n\nUtilize a barra de pesquisa para buscar/vincular disciplinas\n\nOs campos de carga horária devem ser preenchidos como horas-aula"}>
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
                                            <th className={tableStyles.thAction}/>
                                        </tr>
                                    </thead>
                                    <tbody className={tableStyles.tbody}>
                                        {
                                            curriculum.map((curriculumData, index) => (
                                                <tr className={tableStyles.tr} style={{transform: 'none'}}>
                                                    {
                                                        (Object.entries(curriculumData) as [keyof CurriculumInterface, any][]).map(([key]) => {
                                                            if (key === 'id') return null

                                                            if (key === 'subject') {
                                                                return (
                                                                // Troca o id da disciplina pelo nome que está no state subjects[index].name
                                                                <td className={tableStyles.td} style={{ maxWidth: '100px' }}>
                                                                    <div className={styles.searchContainer}>
                                                                        {/* Passa o nome para o campo de pesquisa */}
                                                                        <CustomSearch
                                                                            value={subjects[index].name ?? ''}
                                                                            onSearch={() => fetchSubjects(index)}
                                                                            setSearch={(param) => {
                                                                                const updated = [...subjects]

                                                                                updated[index].name = param

                                                                                setSubjects(updated)
                                                                            }}
                                                                        />
                                                                        <CustomOptions
                                                                            options={subjectOptions[index]}
                                                                            searched={subjectSearched[index]}
                                                                            onSelect={(option) => {
                                                                                 const alreadySelected = curriculum.some(
                                                                                    (item, i) => i !== index && item.subject === option.id
                                                                                );

                                                                                if (alreadySelected) return;
                                                                            
                                                                                const updatedCurriculum = [...curriculum];
                                                                                updatedCurriculum[index].subject = option.id;
                                                                                setCurriculum(updatedCurriculum);

                                                                                const updatedSubjects = [...subjects];
                                                                                updatedSubjects[index].name = option.title;
                                                                                setSubjects(updatedSubjects);

                                                                                // Limpa apenas a posição atual
                                                                                const updatedSubjectOptions = [...subjectOptions];
                                                                                updatedSubjectOptions[index] = [];
                                                                                setSubjectOptions(updatedSubjectOptions);

                                                                                const updatedSubjectSearched = [...subjectSearched];
                                                                                updatedSubjectSearched[index] = false;
                                                                                setSubjectSearched(updatedSubjectSearched);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                )
                                                            }

                                                            if (key === 'pre_requisits' && period > 1) {
                                                                return (
                                                                    <td className={tableStyles.td} style={{ maxWidth: '80px' }}>
                                                                        <div className={styles.searchContainer}>
                                                                            <CustomSearch
                                                                                value={preReqSearch[index] ?? ''}
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
                                                                                    const updatedPreReq = [...subjects];
                                                                                    updatedPreReq[index].preRequisits.push(option.extraField!);
                                                                                    setSubjects(updatedPreReq);

                                                                                    const updatedCurriculum = [...curriculum];
                                                                                    const subject = { ...updatedCurriculum[index] };

                                                                                    const currentPreReqs = subject.pre_requisits ?? [];

                                                                                    const alreadyAdded = currentPreReqs.some(pr =>
                                                                                        typeof pr === 'object' ? pr.id === option.id : pr === option.id
                                                                                    );
                                                                                    if (alreadyAdded) return; // ou um toast

                                                                                    subject.pre_requisits = [...currentPreReqs, option.id];
                                                                                    updatedCurriculum[index] = subject;

                                                                                    setCurriculum(updatedCurriculum);

                                                                                    // Limpa somente a posição index dos estados
                                                                                    const updatedPreReqOptions = [...preReqOptions];
                                                                                    updatedPreReqOptions[index] = [];
                                                                                    setPreReqOptions(updatedPreReqOptions);

                                                                                    const updatedPreReqSearched = [...preReqSearched];
                                                                                    updatedPreReqSearched[index] = false;
                                                                                    setPreReqSearched(updatedPreReqSearched);

                                                                                    const updatedPreReqSearch = [...preReqSearch];
                                                                                    updatedPreReqSearch[index] = '';
                                                                                    setPreReqSearch(updatedPreReqSearch);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {
                                                                            curriculumData.pre_requisits.length > 0 ? (
                                                                                <div className={styles.preReqContainer}>
                                                                                    {
                                                                                        curriculumData.pre_requisits.map((preReq, pIndex) => (
                                                                                            <div key={pIndex} className={styles.preReq}>
                                                                                                {subjects[index].preRequisits[pIndex]}
                                                                                                <img 
                                                                                                src={typeof preReq !== 'string' ? deleteIcon : clear} 
                                                                                                className={tableStyles.action} 
                                                                                                alt=""
                                                                                                onClick={() => {
                                                                                                    if (typeof preReq !== 'string') {
                                                                                                        deletePreReq(index, pIndex, curriculumData.subject, preReq.id)
                                                                                                    } else {
                                                                                                    // Atualiza visual dos nomes dos pré-requisitos (subjects)
                                                                                                        const updatedSubjects = [...subjects];
                
                                                                                                        // Cópia segura da disciplina (subject) com nome de exibição de pré-requisitos
                                                                                                        const updatedDisplaySubject = { ...updatedSubjects[index] };
                
                                                                                                        // Remove o pré-requisito visual com base no índice
                                                                                                        updatedDisplaySubject.preRequisits = updatedDisplaySubject.preRequisits.filter((_, i) => i !== pIndex);
                
                                                                                                        // Atualiza o subject no array
                                                                                                        updatedSubjects[index] = updatedDisplaySubject;
                
                                                                                                        // Atualiza o estado visual
                                                                                                        setSubjects(updatedSubjects);
                
                                                                                                        // Atualiza o estado do curriculum real (curriculum)
                                                                                                        const updatedCurriculum = [...curriculum];
                                                                                                        const updatedCurriculumSubject = { ...updatedCurriculum[index] };
                
                                                                                                        updatedCurriculumSubject.pre_requisits = updatedCurriculumSubject.pre_requisits.filter((_, i) => i !== pIndex);
                                                                                                        updatedCurriculum[index] = updatedCurriculumSubject;
                
                                                                                                        // Atualiza o estado do period
                                                                                                        setCurriculum(updatedCurriculum);
                                                                                                    }}
                                                                                                }/>
                                                                                            </div>
                                                                                        ))
                                                                                    }
                                                                                </div>
                                                                            ) : null
                                                                        }
                                                                    </td>
                                                                )
                                                            }
                                                            
                                                            if (textFields.includes(key)) {
                                                                return (
                                                                    <td className={tableStyles.td} style={{ maxWidth: '35px' }}>
                                                                        <CustomInput
                                                                            type="text"
                                                                            value={String(curriculumData[key as keyof CurriculumInterface]) ?? ''}
                                                                            onChange={(e) => {
                                                                                const inputValue = e.target.value;
                                                                                const isNumeric = !isNaN(Number(inputValue));

                                                                                if (isNumeric) {
                                                                                    const updatedCurriculum = [...curriculum];
                                                                                    const updatedSubject = { ...updatedCurriculum[index] };

                                                                                    if (textFields.includes(key as keyof CurriculumInterface)) {
                                                                                        updatedSubject[key as keyof CurriculumInterface] = inputValue;
                                                                                        updatedCurriculum[index] = updatedSubject;
                                                                                        setCurriculum(updatedCurriculum);
                                                                                    }
                                                                                }
                                                                            }}

                                                                        />
                                                                    </td>
                                                                )
                                                            }
                                                        })
                                                    }
                                                <td className={tableStyles.tdAction}>
                                                    <img 
                                                        src={curriculumData.id ? deleteIcon : clear} 
                                                        className={tableStyles.action} 
                                                        alt=""
                                                        onClick={() => {
                                                            if (curriculumData.id) {
                                                                deleteSubject(index, curriculumData.id)
                                                            } else {
                                                                const updatedCurriculum = curriculum.filter((_, i) => i !== index)

                                                                setCurriculum(updatedCurriculum)
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