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
import { toast, ToastContainer } from 'react-toastify'
import CustomSearch from '../../../../components/customSearch/CustomSearch'
import CustomOptions from '../../../../components/customOptions/CustomOptions'
import clear from '../../../../assets/close-svgrepo-com.svg'
import deleteIcon from '../../../../assets/delete-svgrepo-com.svg'
import calendarIcon from '../../../../assets/calendar-svgrepo-com-green.svg'
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
                    // Caso não hajam períodos
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
        });
    };

    const periodAlreadyExists = (periodNumber: number) => {
        const periodSubjects = PPC.curriculum.filter((subject) => subject.period === periodNumber)

        return periodSubjects.some((subject) => subject.id)
    }

    const deletePeriod = async (periodNumber: number) => {
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

    useEffect(() => {
        setPeriods(groupByPeriod(PPC.curriculum))
    }, [PPC.curriculum])
    
    useEffect(() => {
        if (state) fetchPPC()
        }, [state])

    useEffect(() => {
        console.log(curriculum)
    }, [curriculum])

    return (
        <FormContainer title={state ? 'Editar PPC' : 'Cadastrar PPC'} width='60%' formTip={"Preencha os campos obrigatórios (*)\n\nUtilize a barra de pesquisa para buscar/vincular o curso so PPC\n\nUtilize o botão de '+' para adicionar novos períodos ao PPC.\n\nClique no respectivo período para editá-lo"}>
            <ToastContainer/>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
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
                                setSearch={setCourse}
                                value={course}
                            />
                            {errors.course ? <ErrorMessage message={errors.course}/> : null}
                            <CustomOptions
                                onSelect={(option) => {
                                    // Passa o id do curso selecionado para o form de PPC
                                    setPPC({...PPC, course: option.id})
                                    setCourse(option.title)
                                    setSearched(false)
                                    setCourseOptions([])
                                }}
                                options={courseOptions}
                                searched={searched}
                            />
                        </div>
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <div className={styles.container}>
                        <label className={styles.label}>
                            Períodos *
                            <button className={styles.addButton} type='button' 
                                onClick={() => {
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

                                    setPPC((prev) => ({
                                        ...prev,
                                        curriculum: [...prev.curriculum, newCurriculumItem]
                                    }));

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
                            >
                                +
                            </button>
                        </label>
                        <div className={styles.periodsContainer}>
                        {errors.period ? <ErrorMessage message={errors.period}/> : null}
                        {
                            periods.map((periodNumber, index) => {
                                const periodTitle = `${periodNumber}º Período`;

                                return (
                                    <div key={index}>
                                        <div className={styles.periodContainer}>
                                            <div className={styles.periodHeader}>
                                                <p className={styles.periodTitle}>{periodTitle}</p>
                                                <img
                                                    src={periodAlreadyExists(periodNumber) ? deleteIcon : clear}
                                                    alt=""
                                                    className={styles.clearIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (periodAlreadyExists(periodNumber)) {
                                                            deletePeriod(periodNumber)
                                                        } else {
                                                            setPPC((prev) => {
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
                                                                        (c) => !c.period.startsWith(`${periodNumber}º`)
                                                                    )

                                                                    // Renumera visualmente de acordo com o novo índice
                                                                    return filteredVisual.map((c, idx) => ({
                                                                        ...c,
                                                                        period: `${idx + 1}º Período`
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
                                                            })
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div
                                                className={styles.period}
                                                onClick={() =>
                                                    setPeriodIsOpen((prev) => {
                                                        const updated = [...prev];
                                                        updated[index] = true;
                                                        return updated;
                                                    })
                                                }
                                            >
                                                <img src={calendarIcon} alt="" className={styles.calendarIcon} />
                                                {errors.curriculum[index] ? (
                                                    <ErrorMessage message={errors.curriculum[index]} align="center" />
                                                ) : null}
                                            </div>
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
                                                    curriculum={PPC.curriculum.filter((c) => c.period === periodNumber)}
                                                    subjects={curriculum.find((c) => c.period.includes(periodTitle))!.subjects}
                                                    setSubjects={(updatedSubjects) => {
                                                        setCurriculum((prev) => {
                                                            const updated = prev.map((c) => {
                                                                if (c.period === periodTitle) {
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
                                                            const filtered = prev.curriculum.filter(
                                                                (s) => s.period !== periodNumber
                                                            );
                                                            return {
                                                                ...prev,
                                                                curriculum: [...filtered, ...updatedCurriculum],
                                                            };
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
                </div>
                <div className={styles.buttonContainer}>
                    <CustomButton text={state ? 'Salvar alterações' : 'Cadastrar'} type={'submit'}/>
                </div>
            </form>
        </FormContainer>
    )
}

export default PPCForm