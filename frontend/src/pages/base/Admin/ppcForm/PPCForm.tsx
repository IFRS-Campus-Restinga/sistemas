import { useLocation } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './PPCForm.module.css'
import { useState } from 'react'
import type { PPCInterface } from '../../../../services/ppcService'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import { validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CourseService from '../../../../services/courseService'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomSearch from '../../../../components/customSearch/CustomSearch'
import CustomOptions from '../../../../components/customOptions/CustomOptions'
import clear from '../../../../assets/close-svgrepo-com-white.svg'
import CurriculumTable from '../../../../features/curriculumTable/CurriculumTable'
import Modal from '../../../../components/modal/Modal'

interface ErrorsSubjectsForm {
    subject: string | null
    subject_teach_workload: string | null 
    subject_ext_workload: string | null
    subject_remote_workload: string | null
    weekly_periods: string | null
}

interface ErrorsPPCForm {
    title: string | null
    course: string | null
    subjects: Array<ErrorsSubjectsForm | null>
}

interface Subject {
    name: string
    preRequists: string[]
}

const PPCForm = () => {
    const location = useLocation()
    const { state } = location
    const [searched, setSearched] = useState<boolean>(false)
    // Nome do curso
    const [course, setCourse] = useState<string>('')
    // Campo de opções de curso
    const [courseOptions, setCourseOptions] = useState([])
    // Nome das disciplinas e nome dos pré requisitos { name : 'disciplina', preReq: ['preReq1', 'preReq2']}
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [periodIsOpen, setPeriodIsOpen] = useState<boolean[]>([])
    const [PPC, setPPC] = useState<PPCInterface>({
        title: '',
        course: '',
        // ids das disciplinas
        periods: []
    })
    const [errors, setErrors] = useState<ErrorsPPCForm>({
        title: null,
        course: null,
        subjects: []
    })

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

    return (
        <FormContainer title={state ? 'Editar PPC' : 'Cadastrar PPC'} width='60%' formTip={"Preencha os campos obrigatórios (*)\n\nUtilize a barra de pesquisa para buscar/vincular o curso so PPC\n\nUtilize o botão de '+' para adicionar novos períodos ao PPC.\n\nClique no respectivo período para editá-lo"}>
            <form className={styles.form}>
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
                                    setPPC((prev) => {
                                        const updated = [...prev.periods]

                                        updated.push({number: prev.periods.length + 1, curriculum: []})

                                        return {
                                            ...prev,
                                            periods: updated
                                        }
                                    })
                                }}
                            >
                                +
                            </button>
                        </label>
                        <div className={styles.periodContainer}>
                        {
                    
                            PPC.periods.map((period, index) => (
                                <div key={index}>
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
                                        <img
                                            src={clear}
                                            alt=""
                                            className={styles.clearIcon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPPC((prev) => {
                                                    const prevPeriods = [...prev.periods];
                                                    const newPeriods = prevPeriods.filter((_, pIndex) => pIndex !== index);
                                                    const updatedPeriods = newPeriods.map((period, pIndex) => ({
                                                        number: pIndex + 1,
                                                        curriculum: period.curriculum,
                                                    }));
                                                    return {
                                                        ...prev,
                                                        periods: updatedPeriods,
                                                    };
                                                });
                                            }}
                                        />
                                        {`${period.number}º Período`}
                                    </div>

                                    {periodIsOpen[index] && (
                                        <Modal 
                                            setIsOpen={(param) => 
                                                setPeriodIsOpen((prev) => {
                                                const updated = [...prev]

                                                updated[index] = param

                                                return updated
                                                })
                                            }
                                        >
                                            <CurriculumTable
                                                state={state}
                                                title={`${period.number}º Período`}
                                                period={PPC.periods[index]}
                                                subjects={subjects}
                                                setSubjects={setSubjects}
                                                setPeriod={(updatedPeriod) =>
                                                    setPPC((prev) => {
                                                        const updated = [...prev.periods]
                                                        updated[index] = updatedPeriod
                                                        return {
                                                        ...prev,
                                                        periods: updated
                                                        }
                                                    })
                                                }
                                            />
                                        </Modal>
                                    )}
                                </div>
                            ))
                        }
                        </div>
                    </div>
                </div>
            </form>
        </FormContainer>
    )
}

export default PPCForm