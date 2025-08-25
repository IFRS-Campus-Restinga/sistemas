import { useLocation } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './PPCForm.module.css'
import { useEffect, useState } from 'react'
import type { CurriculumInterface, PPCInterface } from '../../../../services/ppcService'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import { validateMandatoryArrayField, validateMandatoryStringField, validateMandatoryUUIDField } from '../../../../utils/validations/generalValidations'
import CourseService from '../../../../services/courseService' 
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomSearch from '../../../../components/customSearch/CustomSearch'
import CustomOptions from '../../../../components/customOptions/CustomOptions'
import clear from '../../../../assets/close-svgrepo-com-white-thick.svg'
import deleteIcon from '../../../../assets/delete-svgrepo-com-white.svg'
import editIcon from '../../../../assets/edit-3-svgrepo-com-white.svg'
import uploadIcon from '../../../../assets/upload-svgrepo-com-white.svg'
import checkIcon from '../../../../assets/check-svgrepo-com-white.svg'
import CurriculumTable from '../../../../features/curriculumTable/CurriculumTable'
import Modal from '../../../../components/modal/Modal'
import CustomButton from '../../../../components/customButton/CustomButton'
import PPCService from '../../../../services/ppcService'
import ErrorMessage from '../../../../components/errorMessage/ErrorMessage'
import { groupByPeriod } from '../../../../utils/groupByPeriod'

interface ErrorsPPCForm {
    title: string | null
    course: string | null
    period: string | null
    curriculum: Array<string | null>
}

interface Subject {
    name: string
    preRequisits: string[]
}

interface Curriculum {
    period: string
    subjects: Subject[]
}


const PPCForm = () => {
    const location = useLocation()
    const { state } = location
    const [searched, setSearched] = useState<boolean>(false)
    const [periods, setPeriods] = useState<number[]>([])
    // Nome do curso
    const [course, setCourse] = useState<string>('')
    // Campo de opções de curso
    const [courseOptions, setCourseOptions] = useState([])
    // Controla os dados que aparecem: nome do período, nome das disciplinas e nome dos pré-requisitos
    const [curriculum, setCurriculum] = useState<Curriculum[]>([])
    // Controla se o modal do período respectivo está aberto
    const [periodIsOpen, setPeriodIsOpen] = useState<boolean[]>([])
    const [uploadPPC, setUploadPPC] = useState<boolean>(state ? false : true)
    const [PPC, setPPC] = useState<PPCInterface>({
        title: '',
        course: '',
        curriculum: []
    })
    const [errors, setErrors] = useState<ErrorsPPCForm>({
        title: null,
        course: null,
        period: null,
        curriculum: []
    })

    const fetchPPC = async () => {
        try {
            const res = await PPCService.get(state, 'edit_details')

            setPPC(res.data.ppc)
            setCurriculum(res.data.curriculum)
            setCourse(res.data.course)
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
        }
    }

    const fetchCourses = async () => {
        setSearched(true)

        try {
            const res = await CourseService.list(1, course, 'search')

            setCourseOptions(res.data.results)
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
        }
    }

    const validateForm = () => {
        let newErrors: ErrorsPPCForm = {
            title: null,
            course: null,
            period: null,
            curriculum: []
        }

        for (let field in PPC) {
            switch (field) {
                case 'title':
                    newErrors.title = validateMandatoryStringField(PPC.title)
                    break;
                case 'course':
                    newErrors.course = validateMandatoryUUIDField(PPC.course)
                    break;
                case 'periods':
                    if (state) {
                        if (PPC.curriculum instanceof File) {
                             // Validação do PDF
                            const file = PPC.curriculum as File;

                            if (file.type !== "application/pdf") {
                                newErrors.period = "O arquivo deve ser um PDF";
                            } else if (file.size > 5 * 1024 * 1024) {
                                newErrors.period = "O arquivo PDF é muito grande (máx 5MB)";
                            } else {
                                newErrors.period = null;
                            }
                        } else {
                            newErrors.period = validateMandatoryArrayField(PPC.curriculum, "O PPC deve possui ao menos um período")
        
                            PPC.curriculum.map((curriculumData, index) => {
                                for (let sField in curriculumData) {
                                    // valida a disciplina
                                    if (sField === 'subject') {
                                        newErrors.curriculum[index] = validateMandatoryUUIDField(curriculumData.subject, 'O currículo possui campos não preenchidos');
                                    } else {
                                        const value = curriculumData[sField as keyof CurriculumInterface];
                                        
                                        if (typeof value === 'string') {
                                            newErrors.curriculum[index] = validateMandatoryStringField(value, 'O currículo possui campos não preenchidos');
                                        }
                                    }
                                }
                            })                    
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).every((error) => error === null || error.every((value: []) => value === null))
    }

    const removeEmtpyItems = () => {
        setPPC((prev) => {
            if (!(prev.curriculum instanceof File)) {
                const filtered = prev.curriculum.filter((item) => {
                    return Object.entries(item).some(([key, value]) => {
                        if (key === 'period') return false;
    
                        if (typeof value === 'string' && value.trim() !== '') return true;
    
                        if (key === 'pre_requisits' && Array.isArray(value) && value.length > 0) return true;
    
                        return false;
                    });
                });
    
                // Identificar os períodos que ainda têm disciplinas
                const remainingPeriods = [...new Set(filtered.map((item) => item.period))];
    
                // Atualiza o visual (curriculum e setPeriodIsOpen)
                setCurriculum((prevCurriculum) => {
                    const updated = prevCurriculum
                        .filter((curriculum) => {
                            const periodNumber = parseInt(curriculum.period);
                            return remainingPeriods.includes(periodNumber);
                        })
                        .map((curriculum, idx) => ({
                            ...curriculum,
                            period: `${idx + 1}º Período`
                        }));
    
                    return updated;
                });
    
                setPeriodIsOpen((prevOpen) =>
                    prevOpen.filter((_, idx) => remainingPeriods.includes(idx + 1))
                );
    
                return {
                    ...prev,
                    curriculum: filtered
                };
            }

            return prev
        });
    };

    const periodAlreadyExists = (periodNumber: number) => {
        if (!(PPC.curriculum instanceof File)) {
            const periodSubjects = PPC.curriculum.filter((subject) => subject.period === periodNumber)
    
            return periodSubjects.some((subject) => subject.id)
        }
    }

    const deletePeriod = async (periodNumber: number) => {
        if (!(PPC.curriculum instanceof File)) {
            try {
                await PPCService.deletePeriod(state, periodNumber)
    
                setPPC({...PPC, curriculum: PPC.curriculum.filter((subject) => subject.period !== periodNumber)})
                setCurriculum(curriculum.filter((curriculum) => !curriculum.period.includes(`${periodNumber}º Período`)))
    
                toast.success('Período removido com sucesso', {
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
                } else {
                    console.error(error)
                }
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            toast.promise(
                state ?
                PPCService.edit(state, PPC) :
                PPCService.create(PPC),
                {
                    pending: state ? 'Salvando alterações' : 'Cadastrando PPC',
                    success: state ? 'Alterações salvas com sucesso' : 'PPC criado com sucesso',
                    error: {
                        render({ data }: { data: any }) {
                            return data.message || 'Erro ao alterar dados'
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];

            // Verifica se é PDF
            if (file.type === "application/pdf") {
                setPPC({...PPC, curriculum: file});
            } else {
                alert("Por favor, selecione um arquivo PDF.");
            }
        }
    };

    useEffect(() => {
        if (!(PPC.curriculum instanceof File)) setPeriods(groupByPeriod(PPC.curriculum))
    }, [PPC.curriculum])

    useEffect(() => {
        setCourseOptions([])
        setSearched(false)
    }, [PPC.course])
    
    useEffect(() => {
        if (state) fetchPPC()
    }, [state])

    return (
        <FormContainer title={state ? 'Editar PPC' : 'Cadastrar PPC'} width={uploadPPC ? '40%' : '60%'} formTip={"Preencha os campos obrigatórios (*)\n\nUtilize a barra de pesquisa para buscar/vincular o curso so PPC\n\nUtilize o botão de '+' para adicionar novos períodos ao PPC.\n\nClique no respectivo período para editá-lo"}>
            <form className={styles.form} onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                    e.preventDefault(); // impede o envio
                    }
                }}
            >
                <div className={styles.formGroup} style={{flexDirection: uploadPPC ? 'column' : 'row'}}>
                    <CustomLabel title='Título *'>
                        <CustomInput
                            type='text'
                            value={PPC.title}
                            onChange={(e) => setPPC({...PPC, title: e.target.value})}
                            onBlur={() => setErrors({...errors, title: validateMandatoryStringField(PPC.title)})}
                            error={errors.title}
                        />
                    </CustomLabel>
                    <CustomLabel title='Curso *'>
                        <div className={styles.searchContainer}>
                            {/* Mostra o nome do curso buscado/selecionado */}
                            <CustomSearch
                                onSearch={fetchCourses}
                                value={course}
                                setSearch={(param) => {
                                    setCourse(param)
                                    if (param.length === 0) {
                                        setCourseOptions([])
                                        setSearched(false)
                                    }
                                }}
                            />
                            {errors.course ? <ErrorMessage message={errors.course}/> : null}
                            <CustomOptions
                                options={courseOptions}
                                searched={searched}
                                onSelect={(option) => {
                                    setPPC(prev => ({
                                        ...prev,
                                        course: option.id
                                    }))
                                    setCourse(option.title)
                                }}
                            />
                        </div>
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    {
                        !uploadPPC && !(PPC.curriculum instanceof File) ? (
                            <div className={styles.container}>
                                <label className={styles.label}>
                                    Períodos *
                                    <button className={styles.addButton} type='button' 
                                        onClick={() => {
                                            if (!(PPC.curriculum instanceof File)) {
                                                const maxPeriod = periods.length > 0 ? Math.max(...periods) : 0;
                                                const nextPeriodNumber = maxPeriod + 1;
    
                                                const newCurriculumItem: CurriculumInterface = {
                                                    subject: '',
                                                    subject_teach_workload: '',
                                                    subject_ext_workload: '',
                                                    subject_remote_workload: '',
                                                    weekly_periods: '',
                                                    pre_requisits: [],
                                                    period: nextPeriodNumber
                                                };
    
                                                setPPC((prev) => {
                                                    if (!(prev.curriculum instanceof File)) {

                                                        return {
                                                            ...prev,
                                                            curriculum: [...prev.curriculum, newCurriculumItem]
                                                        }
                                                    }

                                                    return prev
                                                });
    
                                                setCurriculum((prev) => [
                                                    ...prev,
                                                    {
                                                        period: `${nextPeriodNumber}º Período`,
                                                        subjects: [{
                                                            name: '',
                                                            preRequisits: []
                                                        }]
                                                    }
                                                ]);
    
                                                setPeriodIsOpen((prev) => [...prev, false]);
                                                setErrors((prev) => ({ ...prev, period: null, curriculum: [] }));
                                            }}
                                        }
                                    >
                                        +
                                    </button>
                                </label>
                                <div className={styles.periodsContainer}>
                                {errors.period ? <ErrorMessage message={errors.period}/> : null}
                                {
                                    periods.map((periodNumber, index) => {
                                        const periodTitle = `${periodNumber}`;

                                        return (
                                            <div key={index}>
                                                <div className={styles.periodContainer}>
                                                    <span className={styles.periodTitleContainer}>
                                                        <p className={styles.periodTitle}>
                                                            {periodNumber}
                                                        </p>
                                                    </span>
                                                    <div
                                                        className={styles.periodActions}
                                                    >
                                                        <img
                                                            src={editIcon}
                                                            className={styles.icon}
                                                            onClick={() =>
                                                                setPeriodIsOpen((prev) => {
                                                                    const updated = [...prev];
                                                                    updated[index] = true;
                                                                    return updated;
                                                                })
                                                            }
                                                        />
                                                        <img
                                                            src={periodAlreadyExists(periodNumber) ? deleteIcon : clear}
                                                            className={styles.icon}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (periodAlreadyExists(periodNumber)) {
                                                                    deletePeriod(periodNumber)
                                                                } else {
                                                                    setPPC((prev) => {
                                                                        if (!(prev.curriculum instanceof File)) {
                                                                            // 1. Remove todos os itens do período excluído
                                                                            const filtered = prev.curriculum.filter((item) => item.period !== periodNumber)
                
                                                                            // 2. Descobre os períodos únicos remanescentes e ordena
                                                                            const uniqueSortedPeriods = Array.from(
                                                                                new Set(filtered.map((item) => item.period))
                                                                            ).sort((a, b) => a - b)
                
                                                                            // 3. Cria um mapa antigo -> novo (ex: {3: 2, 4: 3})
                                                                            const periodMap = new Map<number, number>()
                                                                            uniqueSortedPeriods.forEach((oldPeriod, idx) => {
                                                                                periodMap.set(oldPeriod, idx + 1)
                                                                            })
                
                                                                            // 4. Renumera os períodos com base no mapa
                                                                            const renumbered = filtered.map((item) => ({
                                                                                ...item,
                                                                                period: periodMap.get(item.period)!
                                                                            }))
                
                                                                            // 5. Atualiza o estado visual `curriculum`
                                                                            setCurriculum((prevCurriculum) => {
                                                                                // Remove o período visual que foi excluído
                                                                                const filteredVisual = prevCurriculum.filter(
                                                                                    (c) => !c.period.startsWith(`${periodNumber}`)
                                                                                )
                
                                                                                // Renumera visualmente de acordo com o novo índice
                                                                                return filteredVisual.map((c, idx) => ({
                                                                                    ...c,
                                                                                    period: `${idx + 1}`
                                                                                }))
                                                                            })
                
                                                                            // 6. Atualiza o estado dos modais abertos
                                                                            setPeriodIsOpen((prevOpen) => {
                                                                                return uniqueSortedPeriods.map((_, idx) => prevOpen[idx] ?? false)
                                                                            })
                
                                                                            // 7. Retorna o novo estado de `PPC`
                                                                            return {
                                                                                ...prev,
                                                                                curriculum: renumbered
                                                                            }
                                                                        }

                                                                        return prev
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    {errors.curriculum[index] ? (
                                                        <ErrorMessage message={errors.curriculum[index]} align="center" />
                                                    ) : null}   
                                                </div>

                                                {periodIsOpen[index] && (
                                                    <Modal
                                                        setIsOpen={(param) => {
                                                            setPeriodIsOpen((prev) => {
                                                                const updated = [...prev];
                                                                updated[index] = param;
                                                                return updated;
                                                            });

                                                            removeEmtpyItems()
                                                        }}
                                                    >
                                                        <CurriculumTable
                                                            state={state}
                                                            title={periodTitle}
                                                            period={Number(periodNumber)}
                                                            curriculum={!(PPC.curriculum instanceof File) ? PPC.curriculum.filter((c) => c.period === periodNumber) : []}
                                                            subjects={curriculum.find((c) => c.period.includes(`${periodNumber}`))!.subjects}
                                                            setSubjects={(updatedSubjects) => {
                                                                setCurriculum((prev) => {
                                                                    const updated = prev.map((c) => {
                                                                        if (c.period.includes(`${periodTitle}`)) {
                                                                            return {
                                                                                ...c,
                                                                                subjects: updatedSubjects
                                                                            };
                                                                        }
                                                                        return c;
                                                                    });
                                                                    return updated;
                                                                });
                                                            }}
                                                            setCurriculum={(updatedCurriculum) =>
                                                                setPPC((prev) => {
                                                                    if (!(prev.curriculum instanceof File)) {
                                                                        const filtered = prev.curriculum.filter(
                                                                            (s) => s.period !== periodNumber
                                                                        );
                                                                        return {
                                                                            ...prev,
                                                                            curriculum: [...filtered, ...updatedCurriculum],
                                                                        };
                                                                    }

                                                                    return prev
                                                                })
                                                            }
                                                        />
                                                    </Modal>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="fileInput" className={styles.fileLabel}>
                                {PPC.curriculum instanceof File ? PPC.curriculum.name : 'Importar PPC'}
                                <img src={uploadIcon} alt="enviar" className={styles.uploadIcon}/>
                                <input id='fileInput' type="file" className={styles.fileInput} accept='application/pdf' onChange={handleFileChange}/>
                            </label>
                        )
                    }
                </div>
                <div className={styles.container}>
                    <div className={styles.uploadContainer}>
                        <button type='button' className={uploadPPC ? styles.uploadActive : styles.uploadInactive} onClick={() => setUploadPPC((prev) => !prev)}>
                            {
                                uploadPPC ? (
                                    <img src={checkIcon} className={styles.uploadBtnIcon}/>
                                ) : null
                            }
                        </button>
                        <p className={uploadPPC ? styles.uploadMessageActive : styles.uploadMessageInactive}>
                            Importar o Projeto Pedagógico de Curso
                        </p>
                    </div>
                    <div className={styles.buttonContainer}>
                        <CustomButton text={state ? 'Salvar alterações' : 'Cadastrar'} type={'submit'}/>
                    </div>
                </div>
            </form>
        </FormContainer>
    )
}

export default PPCForm