import { useLocation, useParams } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './EventForm.module.css'
import { useEffect, useState } from 'react'
import EventService, { EventCategories, EventTypes, type EventInterface } from '../../../../services/eventService'
import { AxiosError } from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { compareDates, validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomSelect from '../../../../components/customSelect/CustomSelect'
import CustomButton from '../../../../components/customButton/CustomButton'
import CustomLoading from '../../../../components/customLoading/CustomLoading'

interface EventFormErrors {
    title: string | null
    start: string | null
    end: string | null
}

const EventForm = () => {
    const location = useLocation()
    const calendarId = useParams().calendarId
    const eventId = useParams().eventId
    const { state } = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [errors, setErrors] = useState<EventFormErrors>({
        title: null,
        start: null,
        end: null,
    })
    const [event, setEvent] = useState<EventInterface>({
        id: '',
        title: '',
        type: EventTypes.DIAS_LETIVOS,
        start: '',
        end: '',
        category: EventCategories.GERAL,
        calendar: calendarId!,
        description: ''
    })

    const fetchEvent = async () => {
        setIsLoading(true)

        try {
            const res = await EventService.get(eventId!)

            setEvent(res.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const validateForm = () => {
        let newErrors: EventFormErrors = {
            end: null,
            start: null,
            title: null,
        }

        for (let field in event) {
            switch (field) {
                case 'title':
                    newErrors.title = validateMandatoryStringField(event.title)
                    break;
                case 'start':
                    newErrors.start = validateMandatoryStringField(event.start)
                    break;
                case 'end':
                    newErrors.end = validateMandatoryStringField(event.end)
                    
                    newErrors.start = compareDates(event.start, event.end)
                    newErrors.end = compareDates(event.start, event.end)
                    break;
                default:
                    break;
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).map((value) => value === null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (validateForm()) {
            toast.promise(
                eventId ?
                EventService.edit(event, eventId) :
                EventService.create(event),
                {
                    pending: eventId ? 'Salvando alterações...' : 'Criando evento...',
                    success: eventId ? 'Registro salvo com sucesso' : 'Evento criado com sucesso',
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
        if (state) {
            if (state.selectedDate) {
                setEvent({...event, start: state.selectedDate})
                setIsLoading(false)
            }
        } else if (eventId) {
            fetchEvent()
        }

        console.log(state)
    }, [state])

    return (
        <FormContainer title='Cadastro de Evento' formTip="Preencha os campos obrigatórios (*)" width='50%'>
            <ToastContainer/>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Título *'>
                                <CustomInput
                                    type='text'
                                    value={event.title}
                                    onChange={(e) => setEvent({...event, title: e.target.value})}
                                    onBlur={() => setErrors({...errors, title: validateMandatoryStringField(event.title)})}
                                    error={errors.title}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Data Início *'>
                                <CustomInput
                                    type='date'
                                    value={event.start}
                                    onChange={(e) => setEvent({...event, start: e.target.value})}
                                    onBlur={() => setErrors({...errors, title: validateMandatoryStringField(event.start)})}
                                    error={errors.start}
                                    min={new Date(state.calendarStart).toISOString().split('T')[0]}
                                    max={new Date(state.calendarEnd).toISOString().split('T')[0]}
                                />
                            </CustomLabel>
                            <CustomLabel title='Data Encerramento *'>
                                <CustomInput
                                    type='date'
                                    value={event.end}
                                    onChange={(e) => setEvent({...event, end: e.target.value})}
                                    onBlur={() => setErrors({...errors, end: validateMandatoryStringField(event.end)})}
                                    error={errors.end}
                                    min={event.start}
                                    max={new Date(state.calendarEnd).toISOString().split('T')[0]}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Tipo *'>
                                <CustomSelect
                                    options={Object.values(EventTypes).map((v) => {
                                        return {
                                            title: v,
                                            value: v
                                        }
                                    })}
                                    onChange={(event) =>
                                        setEvent((prev) => ({
                                        ...prev,
                                        type: event.target.value as EventTypes,
                                        }))
                                    }
                                    value={event.type}
                                />
                            </CustomLabel>
                            <CustomLabel title='Categoria *'>
                                <CustomSelect
                                    options={Object.values(EventCategories).map((v) => {
                                        return {
                                            title: v,
                                            value: v
                                        }
                                    })}
                                    onChange={(event) =>
                                        setEvent((prev) => ({
                                            ...prev,
                                            category: event.target.value as EventCategories,
                                        }))
                                    }
                                    value={event.category}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Descrição'>
                                <textarea 
                                    className={styles.textArea}
                                    value={event.description}
                                    onChange={(e) => setEvent({...event, description: e.target.value})}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomButton text={eventId ? 'Salvar Alterações' : 'Cadastrar'} type='submit'/>
                        </div>
                    </form>
                )
            }
        </FormContainer>
    )
}

export default EventForm
