import { useLocation, useNavigate, useParams } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './EventForm.module.css'
import { useEffect, useState } from 'react'
import EventService, { EventCategories, EventTypes, type EventInterface } from '../../../../services/eventService'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { compareDates, validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomSelect from '../../../../components/customSelect/CustomSelect'
import CustomButton from '../../../../components/customButton/CustomButton'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomTextArea from '../../../../components/customTextArea/CustomTextArea'
import flattenValues from '../../../../utils/flattenObj'

interface EventFormErrors {
    title: string | null
    start: string | null
    end: string | null
}

const EventForm = () => {
    const location = useLocation()
    const redirect = useNavigate()
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
            const res = await EventService.get(eventId!, 'id, title, start, end, type, category, description, calendar.id')

            setEvent(flattenValues(res.data))
        } catch (error) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message)
            } else {
                console.error(error)
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
                    success: {
                        render({data}) {
                            return data.data.message
                        }
                    },
                    error: "Erro de validação"
                }
            ).then((res) => {
                    if (res.status === 201 || res.status === 200) {
                        setTimeout(() => {
                            redirect(`/session/admin/calendarios/${calendarId}/`, {state: calendarId});
                        }, 2000);
                    }
            }).catch((err) => {
                if (err instanceof AxiosError) {
                    const errors = err.response?.data?.message;
    
                    if (Array.isArray(errors)) {
                        errors.forEach((msg: string) => toast.error(msg));
                    } else {
                        toast.error(errors);
                    }
                }
            })
        }
    }

    useEffect(() => {
        if (state) {
            if (state.selectedDate) {
                setEvent({...event, start: state.selectedDate})
                setIsLoading(false)
            } else  {
                fetchEvent()
            }
        }
    }, [state])

    return (
        <FormContainer title='Cadastro de Evento' formTip="Preencha os campos obrigatórios (*)" width='50%'>
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
                                    onSelect={(option) => {
                                        if ('value' in option) {
                                            setEvent((prev) => ({
                                                ...prev,
                                                type: option.value as EventTypes,
                                            }))
                                        }
                                    }}
                                    selected={
                                        {
                                            title: event.type,
                                            value: event.type
                                        }
                                    }
                                    renderKey='title'
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
                                    onSelect={(option) => {
                                        if ('value' in option) {
                                            setEvent((prev) => ({
                                                ...prev,
                                                category: option.value as EventCategories,
                                            }))
                                        }
                                    }}
                                    selected={
                                        {
                                            title: event.category,
                                            value: event.category
                                        }
                                    }
                                    renderKey='title'
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.formGroup}>
                            <CustomLabel title='Descrição'>
                                <CustomTextArea 
                                    value={event.description ?? ''}
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
