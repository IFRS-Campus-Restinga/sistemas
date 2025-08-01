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

    const { grouped, periods } = groupByPeriod(PPC.curriculum);

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
        console.log(PPC)
    }, [PPC])

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
                                    // Pega o número atual do maior período no estado curriculum
                                    const existingPeriodsNumbers = curriculum.map(c => {
                                    // extrai o número do texto "1º Período" -> 1
                                    const match = c.period.match(/^(\d+)/);
                                    return match ? Number(match[1]) : 0;
                                    });

                                    const maxPeriod = existingPeriodsNumbers.length > 0 ? Math.max(...existingPeriodsNumbers) : 0;
                                    const nextPeriodNumber = maxPeriod + 1;

                                    setPPC((prev) => {
                                        const updated = [...prev.curriculum]

                                        updated.push({
                                            subject: '',
                                            subject_ext_workload: '',
                                            subject_remote_workload: '',
                                            subject_teach_workload: '',
                                            weekly_periods: '',
                                            pre_requisits: [],
                                            period: nextPeriodNumber
                                        })

                                        return {
                                            ...prev,
                                            curriculum: updated
                                        }
                                    })

                                    setCurriculum([...curriculum, {
                                        period: `${nextPeriodNumber}º Período`, 
                                        subjects: [{
                                            name: '',
                                            preRequisits: []
                                        }]
                                    }])

                                    setPeriodIsOpen((prev) => {
                                        return [...prev, false]
                                    })
                                    
                                    setErrors({...errors, period: null, curriculum: []})
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
                                    <div key={periodNumber}>
                                        <div className={styles.periodContainer}>
                                            <div className={styles.periodHeader}>
                                                <p className={styles.periodTitle}>{periodTitle}</p>
                                                <img
                                                    src={clear}
                                                    alt=""
                                                    className={styles.clearIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPPC((prev) => ({
                                                            ...prev,
                                                            curriculum: prev.curriculum.filter(
                                                                (subject) => subject.period !== periodNumber
                                                            ),
                                                        }));
                                                        setCurriculum((prev) => prev.filter((c) => c.period !== periodTitle));
                                                        setPeriodIsOpen((prev) => prev.filter((_, i) => i !== index));
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

                                                    setPPC((prev) => {
                                                        const updated = prev.curriculum.filter((subject) =>
                                                            Object.entries(subject).some(([key, value]) => {
                                                                if (key === 'period') return false;

                                                                if (typeof value === 'string') {
                                                                    return value.trim() !== '';
                                                                }

                                                                if (Array.isArray(value)) {
                                                                    return value.length > 0;
                                                                }

                                                                return value !== null && value !== undefined;
                                                            })
                                                        );

                                                        return {
                                                            ...prev,
                                                            curriculum: updated
                                                        }
                                                    })

                                                }}
                                            >
                                                <CurriculumTable
                                                    state={state}
                                                    title={periodTitle}
                                                    period={periodNumber}
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