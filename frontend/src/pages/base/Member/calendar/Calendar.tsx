import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar as BigCalendar, dateFnsLocalizer, type Event as BigEvent, type View } from 'react-big-calendar'
import { useEffect, useState, type CSSProperties } from 'react'
import { format, parse, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import EventService, { type EventInterface } from '../../../../services/eventService'
import CalendarService, { type CalendarInterface } from '../../../../services/calendarService'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import styles from './Calendar.module.css' // CSS Modules com as classes abaixo
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 1,
  getDay,
  locales,
})

const colorMap: Record<string, string> = {
  'Semana Pedagógica': '#ff00ff',
  'Feriados e dias não letivos': '#ff0000',
  'Prazo final para registro de notas e entrega de documentos': '#00ffff',
  'Dias letivos': '#ffff00',
  'Recesso Escolar/Férias': '#a9a9a9',
  'Exames': '#f4a460',
  'Conselhos de classe': '#5f9ea0',
  'Vestibular': '#006400',
  'Fim de etapa': '#00ff00',
}

const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Nenhum evento nesse período.',
  showMore: (count: number) => `+ ${count} mais`,
}

interface BigCalendarEvent extends BigEvent {
  id: string
  type: string
  category: string
  description: string
}

const Calendar = () => {
  const location = useLocation()
  const { state } = location
  const navigate = useNavigate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [events, setEvents] = useState<BigCalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<View>('month')
  const [calendar, setCalendar] = useState<CalendarInterface>({
    end: '',
    start: '',
    status: 'Ativo',
    title: '',
    id: ''
  })

  const fetchCalendar = async () => {
    try {
      const res = await CalendarService.get(state)
      setCalendar(res.data)
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message,
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

  const fetchEvents = async (start: Date) => {
    setIsLoading(true)
    try {
      const month = start.getMonth() + 1
      const year = start.getFullYear()

      const res = await EventService.list(month, year)
      const mappedEvents = res.data.map((ev: EventInterface) => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start),
        end: new Date(new Date(ev.end).setDate(new Date(ev.end).getDate() + 1)),
        type: ev.type,
        category: ev.category,
        description: ev.description,
      }))

      setEvents(mappedEvents)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigate = (date: Date) => {
    const start = new Date(calendar!.start) 
    const end = new Date(calendar!.end)

    if (date < end && date > start) setCurrentDate(date)
  }

  const handleViewChange = (view: View) => {
    setCurrentView(view)
  }
  
  // Navega para edição do evento
  const handleSelectEvent = (event: BigCalendarEvent) => {
    // Se quiser bloquear edição de eventos passados, cheque aqui
    if (event.start! >= today) {
      navigate(`eventos/${event.id}/details/`)
    }
  }
  
  // Estilo dos eventos, bloqueando interação e mudando cursor em eventos passados
  const eventStyleGetter = (event: BigCalendarEvent) => {
    const backgroundColor = colorMap[event.type] || '#3174ad'
    const isClickable = event.start! >= today

      const style: CSSProperties = {
        backgroundColor,
        borderRadius: '5px',
        color: 'white',
        border: 'none',
        padding: '2px 5px',
        opacity: isClickable ? 1 : 0.5,
        pointerEvents: isClickable ? 'auto' : 'none',
        cursor: isClickable ? 'pointer' : 'not-allowed',
      }

      return {
        className: isClickable ? styles.clickableEvent : styles.disabledEvent,
        style,
      }
  }
  
  // Estiliza dias anteriores bloqueando cursor e mudando visual
  const dayPropGetter = (date: Date) => {
    if (date < today) {
      return {
        className: styles.disabledDay,
      }
    }
    return {
      className: styles.enabledDay,
    }
  }

  useEffect(() => {
    fetchCalendar()
  }, [state])

  useEffect(() => {
    fetchEvents(currentDate)
  }, [currentDate])
  
  if (isLoading) return <CustomLoading />
  
  return (
    <FormContainer title={calendar.title}>
      <BigCalendar
        localizer={localizer}
        culture="pt-BR"
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onNavigate={handleNavigate}
        view={currentView}
        onView={handleViewChange}
        date={currentDate}
        selectable
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        messages={messages}
        min={today}
      />
    </FormContainer>
  )
}

export default Calendar
