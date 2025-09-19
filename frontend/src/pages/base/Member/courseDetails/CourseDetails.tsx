import { useEffect, useState } from 'react'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './CourseDetails.module.css'
import CourseService, { type CourseInterface } from '../../../../services/courseService'
import { useLocation } from 'react-router-dom'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import tableStyles from '../../../../components/table/Table.module.css'
import CustomLoading from '../../../../components/customLoading/CustomLoading'


const CourseDetails = () => {
    const location = useLocation()
    const {state} = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [course, setCourse] = useState<CourseInterface>({
        category: 'Técnico Integrado ao Ensino Médio',
        classes: [],
        coord: '',
        name: '',
        workload: ''
    })

    const fetchCourse = async () => {
        try {
            const res  = await CourseService.get(state, 'id, name, workload, category, coord.username, course_class.number')

            setCourse({
                category: res.data.category,
                classes: res.data.course_class,
                coord: res.data.coord.username,
                name: res.data.name,
                workload: res.data.workload,
                id: res.data.id
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
                console.log(error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (state) {
            fetchCourse()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <FormContainer title={"Detalhes de Curso"}>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <section className={styles.section}>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Nome'>
                                <CustomInput
                                    type='text'
                                    value={course.name}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Modalidade'>
                                <CustomInput
                                    type='text'
                                    value={course.category}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Carga Horária'>
                                <CustomInput
                                    type='text'
                                    value={course.workload}
                                    onChange={(_) =>  {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Coordenador'>
                                <CustomInput
                                    type='text'
                                    onChange={(_) => {}}
                                    value={course.coord}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        {
                            course.category === 'Técnico Subsequente ao Ensino Médio' ||
                            course.category === 'Técnico Integrado ao Ensino Médio' ? (
                                <div className={styles.sectionGroup}>
                                    <div className={styles.sectionTable}>
                                        <div className={tableStyles.tableContainer}>
                                            <table className={tableStyles.table}>
                                                <thead className={tableStyles.thead}>
                                                    <tr className={tableStyles.tr}>
                                                        <th className={tableStyles.th}>Turmas</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={tableStyles.tbody}>
                                                    {
                                                        course.classes.map((classData, _) => (
                                                            <tr className={tableStyles.tr}>
                                                                <td className={tableStyles.td}>
                                                                    <CustomInput
                                                                        type='text'
                                                                        value={classData.number}
                                                                        onChange={(_) => {}}
                                                                        disabled={true}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) :  null
                        }
                    </section>
                )
            }
        </FormContainer>
    )
}

export default CourseDetails