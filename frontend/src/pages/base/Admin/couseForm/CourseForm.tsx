import { useEffect, useState } from 'react'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './CourseForm.module.css'
import CourseService, { type CourseInterface } from '../../../../services/courseService'
import { useLocation } from 'react-router-dom'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { validateMandatoryArrayField, validateMandatoryStringField, validateMandatoryUUIDField } from '../../../../utils/validations/generalValidations'
import CustomSelect from '../../../../components/customSelect/CustomSelect'
import UserService from '../../../../services/userService'
import clear from '../../../../assets/close-svgrepo-com.svg'
import CustomOptions from '../../../../components/customOptions/CustomOptions'
import tableStyles from '../../../../components/table/Table.module.css'
import deleteIcon from '../../../../assets/delete-svgrepo-com.svg'
import CustomButton from '../../../../components/customButton/CustomButton'
import ErrorMessage from '../../../../components/errorMessage/ErrorMessage'
import CourseClassService from '../../../../services/courseClassService'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomSearch from '../../../../components/customSearch/CustomSearch'

interface ErrorsCourseForm {
    name: string | null
    workload: string | null
    coord: string | null
    classList: string | null
    classes: Array<string | null>
}

const CourseForm = () => {
    const location = useLocation()
    const {state} = location
    const [searched, setSearched] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [coordSearch, setCoordSearch] = useState<string>('')
    const [coordOptions, setCoordOptions] = useState([])
    const [errors, setErrors] = useState<ErrorsCourseForm>({
        classes: [],
        coord: null,
        name: null,
        workload: null,
        classList: null
    })
    const [course, setCourse] = useState<CourseInterface>({
        category: 'Técnico Integrado ao Ensino Médio',
        classes: [],
        coord: '',
        name: '',
        workload: ''
    })

    const fetchCoord = async () => {
        setSearched(true)

        try {
            const res =  await UserService.listByGroup('coord', coordSearch, undefined, 'id, username', true)

            setCoordOptions(res.data.results)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            } else {
                console.log(error)
            }
        }
    }

    const fetchCourse = async () => {
        try {
            const res  = await CourseService.get(state, 'id, name, workload, category, coord.id, coord.username, course_class.id, course_class.number')

            setCourse({
                category: res.data.category,
                classes: res.data.course_class,
                coord: res.data.coord.id,
                name: res.data.name,
                workload: res.data.workload,
                id: res.data.id
            })
            setCoordSearch(res.data.coord.username)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message,
                    {
                        autoClose: 2000,
                        position: 'bottom-center'
                    }
                )
            } else {
                console.log(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const deleteClass = async (classIndex: number, classId: string) => {
        toast.promise(
            CourseClassService.delete(classId),
            {
                pending: 'Excluindo turma',
                success: "Turma excluida com sucesso",
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

        setCourse({...course, classes: course.classes.filter((_, index) => index !== classIndex)})
    }

    const validateForm = () => {
        let newErrors: ErrorsCourseForm = {
            classes: [],
            coord: null,
            name: null,
            workload: null,
            classList: null
        }

        for (let field in course) {
            switch (field) {
                case 'name':
                    newErrors.name = validateMandatoryStringField(course.name)
                    break;
                case 'coord':
                    newErrors.coord = validateMandatoryUUIDField(course.coord)
                    break;
                case 'workload':
                    newErrors.workload = validateMandatoryStringField(course.workload)
                    break;
                case 'classes':
                    if (course.category === 'Técnico Integrado ao Ensino Médio' || 
                        course.category === 'Técnico Subsequente ao Ensino Médio') {
                            if (course.classes.length === 0) newErrors.classList = validateMandatoryArrayField(course.classes)

                            course.classes.map((classData, index) => {
                                newErrors.classes[index] = validateMandatoryStringField(classData.number)
                            })
                        }
                    break;
                default:
                    break;
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).every((error) => error === null || error.every((e: any) => e === null))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            toast.promise(
                (state ? CourseService.edit(state, course) : CourseService.create(course))
                    .then(async (res) => {
                        if (state) {
                            await fetchCourse()
                        }
                        return res
                    }),
                {
                    pending: state ? 'Salvando alterações...' : 'Cadastrando curso...',
                    success: state ? 'Alterações salvas com sucesso' : 'Curso cadastrado com sucesso',
                    error: {
                        render({ data }: { data: any }) {
                            return data?.message || 'Erro ao alterar dados'
                        }
                    }
                }
            )
        }
    }

    useEffect(() => {
        setSearched(false)
        setCoordOptions([])
    }, [course.coord])

    useEffect(() => {
        if (state) {
            fetchCourse()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <FormContainer title={state ? 'Editar Curso' : 'Cadastrar Curso'} formTip={"Preencha os campos obrigatórios (*)\n\nUse o botão '+' abaixo da tabela\npara adicionar turmas."}>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}  
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            e.preventDefault();
                            }
                        }}
                    >
                        <div className={styles.formGroup}>
                            <CustomLabel title='Nome *'>
                                <CustomInput
                                    type='text'
                                    maxLength={100}
                                    value={course.name}
                                    onChange={(e) =>  setCourse({...course, name: e.target.value})}
                                    onBlur={() => setErrors({...errors, name: validateMandatoryStringField(course.name)})}
                                    error={errors.name}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Modalidade *'>
                                <CustomSelect
                                    renderKey='title'
                                    onSelect={(option) => {
                                        if ('value' in option) {
                                            setCourse({
                                                ...course, 
                                                category: option.value,
                                                classes: option.value === 'Técnico Subsequente ao Ensino Médio' || 
                                                option.value === 'Técnico Integrado ao Ensino Médio' ? [] : course.classes
                                            })
                                        }
                                    }}
                                    options={[
                                        {
                                            title: 'Técnico Subsequente ao Ensino Médio',
                                            value: 'Técnico Subsequente ao Ensino Médio'
                                        },
                                        {
                                            title: 'Técnico Integrado ao Ensino Médio',
                                            value: 'Técnico Integrado ao Ensino Médio'
                                        },
                                        {
                                            title: 'Educação de Jovens e Adultos (ProEJA)',
                                            value: 'Educação de Jovens e Adultos (ProEJA)'
                                        },
                                        {
                                            title: 'Especialização',
                                            value: 'Especialização'
                                        },
                                        {
                                            title: 'Superior',
                                            value: 'Superior'
                                        },
                                    ]}
                                    selected={
                                        {
                                            title: course.category,
                                            value: course.category
                                        }
                                    }
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Carga Horária *'>
                                <CustomInput
                                    type='text'
                                    value={course.workload}
                                    maxLength={4}
                                    placeholder='Insira a carga horária em horas-aula'
                                    onChange={(e) =>  {
                                        if (!isNaN(e.target.value)) setCourse({...course, workload: e.target.value})
                                    }}
                                    onBlur={() => setErrors({...errors, workload: validateMandatoryStringField(course.workload)})}
                                    error={errors.workload}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Coordenador *'>
                                <div className={styles.searchContainer}>
                                    <CustomSearch
                                        onSearch={fetchCoord}
                                        value={coordSearch}
                                        setSearch={(param) => {
                                            setCoordSearch(param)
                                            if (param.length === 0) {
                                                setCoordOptions([])
                                                setSearched(false)
                                            }
                                        }}
                                    />
                                    <CustomOptions
                                        options={coordOptions}
                                        onSelect={(option) => {
                                            setCourse((prev) => {
                                                const updated = prev

                                                updated.coord = option.id

                                                return updated
                                            })
                                            setCoordSearch(option.username)
                                        }}
                                        searched={searched}
                                        renderKey='username'
                                    />
                                </div>
                            </CustomLabel>
                        </div>
                        {
                            course.category === 'Técnico Subsequente ao Ensino Médio' ||
                            course.category === 'Técnico Integrado ao Ensino Médio' ? (
                                <div className={styles.formGroup}>
                                    <div className={styles.formTable}>
                                    {errors.classList ? <ErrorMessage message={errors.classList} align='center'/> : null}
                                        <div className={tableStyles.tableContainer}>
                                            <table className={tableStyles.table}>
                                                <thead className={tableStyles.thead}>
                                                    <tr className={tableStyles.tr}>
                                                        <th className={tableStyles.th}>Turmas *</th>
                                                        <th className={tableStyles.thAction}/>
                                                    </tr>
                                                </thead>
                                                <tbody className={tableStyles.tbody}>
                                                    {
                                                        course.classes.map((classData, index) => (
                                                            <tr className={tableStyles.tr}>
                                                                <td className={tableStyles.td}>
                                                                    <CustomInput
                                                                        type='text'
                                                                        value={classData.number}
                                                                        maxLength={3}
                                                                        onChange={(e) => {
                                                                            setCourse((prev) => {
                                                                                const updatedClasses = [...prev.classes]

                                                                                if (!isNaN(e.target.value)) updatedClasses[index].number = e.target.value

                                                                                return {
                                                                                    ...prev,
                                                                                    classes: updatedClasses
                                                                                }
                                                                            })
                                                                        }}
                                                                        onBlur={() => {
                                                                            setErrors((prev) => {
                                                                                const updatedErrors = [...prev.classes]

                                                                                updatedErrors[index] = validateMandatoryStringField(course.classes[index].number)

                                                                                return {
                                                                                    ...prev,
                                                                                    classes: updatedErrors
                                                                                }
                                                                            })
                                                                        }}
                                                                        error={errors.classes[index]}
                                                                    />
                                                                </td>
                                                                <td className={tableStyles.tdAction}>
                                                                    <img className={tableStyles.action} src={classData.id ? deleteIcon : clear} alt="" 
                                                                    onClick={() => {
                                                                        if (classData.id) {
                                                                            deleteClass(index, classData.id!)
                                                                        } else {
                                                                            setCourse({...course, classes: course.classes.filter((_, i) => i !== index)})
                                                                        }
                                                                    }} />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                        <button className={styles.addButton} type='button' onClick={() => setCourse({...course, classes: [...course.classes, { number: '' }]})}>+</button>
                                    </div>
                                </div>
                            ) :  null
                        }
                        <div className={styles.buttonContainer}>
                            <CustomButton text={state ? "Salvar alterações" : "Cadastrar"} type='submit' />
                        </div>
                    </form>
                )
            }
        </FormContainer>
    )
}

export default CourseForm