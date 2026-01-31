import { useEffect, useState } from 'react'
import styles from './CalendarForm.module.css'
import CalendarService, { type CalendarInterface } from '../../../../services/calendarService'
import { useLocation, useNavigate } from 'react-router-dom'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLabel from '../../../../components/customLabel/CustomLabel'
import CustomInput from '../../../../components/customInput/CustomInput'
import { compareDates, validateMandatoryStringField } from '../../../../utils/validations/generalValidations'
import CustomSelect from '../../../../components/customSelect/CustomSelect'
import CustomButton from '../../../../components/customButton/CustomButton'
import { toast } from 'react-toastify'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import { AxiosError } from 'axios'
import Modal from '../../../../components/modal/Modal'

interface CalendarFormErrors {
    title: string | null
    start: string | null
    end: string | null
    status: string | null
}

const CalendarForm = () => {
    const location = useLocation()
    const { state } = location
    const redirect = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [errors, setErrors] = useState<CalendarFormErrors>({
        title: null,
        start: null,
        end: null,
        status: null,
    })
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [calendar, setCalendar] = useState<CalendarInterface>({
        title: '',
        start: '',
        end: '',
        status: 'Ativo'
    })

    const fetchCalendar = async () => {
        try {
            const res = await CalendarService.get(state, 'id, title, start, end, status, description')

            setCalendar(res.data)
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
        let newErrors: CalendarFormErrors = {
            end: null,
            start: null,
            status: null,
            title: null
        }

        for (let field in calendar) {
            switch (field) {
                case 'title':
                    newErrors.title = validateMandatoryStringField(calendar.title)
                    break;
                case 'start':
                    newErrors.start = validateMandatoryStringField(calendar.start)
                    break;
                case 'end':
                    newErrors.end = validateMandatoryStringField(calendar.end)
                    const error = compareDates(calendar.start, calendar.end)
                    newErrors.start = error
                    newErrors.end = error
                    break;
                case 'status':
                    newErrors.status = validateMandatoryStringField(calendar.status)
                    break;
                default:
                    break;
            }
        }

        setErrors(newErrors)
        return Object.values(newErrors).every((value) => value === null)
    }

    const submitCalendar = async () => {
        const request = state
            ? CalendarService.edit(calendar, state)
            : CalendarService.create(calendar);

        toast.promise(
            request, 
            {
                pending: state ? "Salvando alterações..." : "Criando calendário...",
                success: {
                    render({ data }) {
                        return data.data.message;
                    },
                },
                error: "Erro ao cadastrar",
            }).then((res) => {
                if (res.status === 201 || res.status === 200) {
                    setTimeout(() => {
                        redirect("/session/admin/calendarios/");
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
            }
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return

        if (!state) {
            setShowConfirmModal(true)
            return
        }

        submitCalendar()
    };

    useEffect(() => {
        if (state) {
            fetchCalendar()
        } else {
            setIsLoading(false)
        }
    }, [state])

    return (
        <FormContainer title='Cadastro de Calendário' formTip="Preencha os campos obrigatórios (*)" width='50%'>
            {
                isLoading ? (
                    <CustomLoading/>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className={styles.form}>
                        <CustomLabel title='Título *'>
                            <CustomInput
                                type='text'
                                value={calendar.title}
                                onChange={(e) => setCalendar({...calendar, title: e.target.value})}
                                onBlur={() => setErrors({...errors, title: validateMandatoryStringField(calendar.title)})}
                                error={errors.title}
                                maxLength={20}
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
                                        renderKey='title'
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
                                        selected={
                                            {
                                                title: calendar.status,
                                                value: calendar.status
                                            }
                                        }
                                        onSelect={(option) => {
                                            if ('value' in option) {
                                                setCalendar({...calendar, status: option.value})
                                            }
                                        }}
                                        onBlur={() => setErrors({...errors, end: validateMandatoryStringField(calendar.end)})}
                                    />
                            </CustomLabel>
                            </span>
                        </div>
                        <span className={styles.buttonContainer}>
                            <CustomButton text={state ? 'Salvar alteracoes' : 'Cadastrar'} type='submit'/>
                        </span>
                        </form>
                        {showConfirmModal ? (
                            <Modal setIsOpen={setShowConfirmModal}>
                                <div className={styles.modalContent}>
                                    <p className={styles.modalText}>
                                        Registrar um novo calendário irá inativar os existentes, deseja prosseguir?
                                    </p>
                                    <div className={styles.modalActions}>
                                        <CustomButton
                                            type="button"
                                            text="Cadastrar"
                                            onClick={() => {
                                                setShowConfirmModal(false)
                                                submitCalendar()
                                            }}
                                        />
                                        <CustomButton
                                            type="button"
                                            text="Cancelar"
                                            onClick={() => setShowConfirmModal(false)}
                                        />
                                    </div>
                                </div>
                            </Modal>
                        ) : null}
                    </>
                )
            }
        </FormContainer>
    )
}

export default CalendarForm
