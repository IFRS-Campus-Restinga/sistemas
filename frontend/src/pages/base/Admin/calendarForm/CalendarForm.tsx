import { useEffect, useState } from 'react'
import styles from './CalendarForm.module.css'
import CalendarService, { type CalendarInterface } from '../../../../services/calendarService'
import { useLocation } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { compareDates, validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomSelect from '../../../../components/customSelect/CustomSelect'
import CustomButton from '../../../../components/customButton/CustomButton'
import { toast, ToastContainer } from 'react-toastify'

interface CalendarFormErrors {
    title: string | null
    start: string | null
    end: string | null
    status: string | null
}

const CalendarForm = () => {
    const location = useLocation()
    const { state } = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [errors, setErrors] = useState<CalendarFormErrors>({
        title: null,
        start: null,
        end: null,
        status: null,
    })
    const [calendar, setCalendar] = useState<CalendarInterface>({
        title: '',
        start: '',
        end: '',
        status: 'Ativo'
    })

    const fetchCalendar = async () => {
        try {
            const res = await CalendarService.get(state)

            setCalendar(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const validateForm = () => {
        let newErrors: CalendarFormErrors = {
            end: null,
            start: null,
            status: null,
            title: null
        }

        for (let field in calendar) {
            switch (field) {
                case 'title':
                    setErrors({...errors, title: validateMandatoryStringField(calendar.title)})
                    break;
                case 'start':
                    setErrors({...errors, start: validateMandatoryStringField(calendar.start)})
                    break;
                case 'end':
                    setErrors({...errors, end: validateMandatoryStringField(calendar.end)})
                    
                    let error = compareDates(calendar.start, calendar.end)
                    setErrors({...errors, start: error, end: error})
                    break;
                case 'status':
                    setErrors({...errors, status: validateMandatoryStringField(calendar.status)})
                    break;
                default:
                    break;
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).every((value) => value === null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            toast.promise(
                state ?
                CalendarService.edit(calendar, state):
                CalendarService.create(calendar),
                {
                    pending: state ? 'Salvando alterações...' : 'Criando calendário...',
                    success: state ? 'Registro atualizado com sucesso' : 'Calendário criado com sucesso',
                    error: {
                        render({ data }: { data: any }) {
                            return data.message || 'Erro ao alterar dados'
                        }
                    }
                }
            )
        }
    }

    useEffect(() => {
        if (state) fetchCalendar()
    }, [state])

    return (
        <FormContainer title='Cadastro de Calendário' formTip="Preencha os campos obrigatórios (*)" width='50%'>
            <ToastContainer/>
            <form onSubmit={handleSubmit} className={styles.form}>
                <CustomLabel title='Título *'>
                    <CustomInput
                        type='text'
                        value={calendar.title}
                        onChange={(e) => setCalendar({...calendar, title: e.target.value})}
                        onBlur={() => setErrors({...errors, title: validateMandatoryStringField(calendar.title)})}
                        error={errors.title}
                        max={20}
                    />
                </CustomLabel>
                <div className={styles.formGroup}>
                    <CustomLabel title='Data início *'>
                        <CustomInput
                            type='date'
                            value={calendar.start}
                            onChange={(e) => setCalendar({...calendar, start: e.target.value})}
                            onBlur={() => setErrors({...errors, start: validateMandatoryStringField(calendar.start)})}
                            error={errors.start}
                        />
                    </CustomLabel>
                    <CustomLabel title='Data encerramento *'>
                        <CustomInput
                            type='date'
                            value={calendar.end}
                            onChange={(e) => setCalendar({...calendar, end: e.target.value})}
                            onBlur={() => setErrors({...errors, end: validateMandatoryStringField(calendar.end)})}
                            error={errors.end}
                            min={calendar.start}
                        />
                    </CustomLabel>
                </div>
                <div className={styles.formGroup}>
                    <span className={styles.inputContainer}>
                        <CustomLabel title='Status *'>
                            <CustomSelect
                                options={[
                                    {
                                        title: 'Ativo',
                                        value: 'Ativo',
                                    },
                                    {
                                        title: 'Suspenso',
                                        value: 'Suspenso',
                                    },
                                    {
                                        title: 'Cancelado',
                                        value: 'Cancelado',
                                    },
                                ]}
                                value={calendar.end}
                                onChange={(e) => setCalendar({...calendar, end: e.target.value})}
                                onBlur={() => setErrors({...errors, end: validateMandatoryStringField(calendar.end)})}
                            />
                    </CustomLabel>
                    </span>
                </div>
                <span className={styles.buttonContainer}>
                    <CustomButton text={state ? 'Salvar alteracoes' : 'Cadastrar'} type='submit'/>
                </span>
            </form>
        </FormContainer>
    )
}

export default CalendarForm