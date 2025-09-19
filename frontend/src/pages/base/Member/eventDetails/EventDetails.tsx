import { useLocation, useParams } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import styles from './EventDetails.module.css'
import { useEffect, useState } from 'react'
import EventService, { EventCategories, EventTypes, type EventInterface } from '../../../../services/eventService'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import CustomTextArea from '../../../../components/customTextArea/CustomTextArea'

const EventDetails = () => {
    const location = useLocation()
    const calendarId = useParams().calendarId
    const eventId = useParams().eventId
    const { state } = location
    const [isLoading, setIsLoading] = useState<boolean>(true)
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
            const res = await EventService.get(eventId!, 'id, title, start, end, type, category, description')

            setEvent(res.data)
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

    useEffect(() => {
        if (state) {
            fetchEvent()
        }
    }, [state])

    return (
        <FormContainer title='Detalhes do Evento' width='50%'>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <section className={styles.section}>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Título'>
                                <CustomInput
                                    type='text'
                                    value={event.title}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Data Início'>
                                <CustomInput
                                    type='date'
                                    value={event.start}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                            <CustomLabel title='Data Encerramento'>
                                <CustomInput
                                    type='date'
                                    value={event.end}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Tipo'>
                                <CustomInput
                                    type='text'
                                    value={event.type}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                            <CustomLabel title='Categoria'>
                                <CustomInput
                                    type='text'
                                    value={event.category}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                        <div className={styles.sectionGroup}>
                            <CustomLabel title='Descrição'>
                                <CustomTextArea 
                                    value={event.description ?? ''}
                                    onChange={(_) => {}}
                                    disabled={true}
                                />
                            </CustomLabel>
                        </div>
                    </section>
                )
            }
        </FormContainer>
    )
}

export default EventDetails
