import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar as BigCalendar, dateFnsLocalizer, type Event as BigEvent, type View } from 'react-big-calendar'
import { useEffect, useState, type CSSProperties } from 'react'
import { format, parse, getDay, startOfMonth, endOfMonth, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns'
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
      const res = await CalendarService.get(state, 'id, title, start, end, status')
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

      const res = await EventService.list(month, year, 'id, title, start, end, type')
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
    const start = startOfMonth(new Date(calendar!.start))
    const end = endOfMonth(new Date(calendar!.end))
    const target = startOfMonth(date)

    if (!isBefore(target, start) && !isAfter(target, end)) {
      setCurrentDate(date)
    }
  }

  const handleViewChange = (view: View) => {
    setCurrentView(view)
  }

  const getMinSelectableDate = () => {
    const calendarStart = startOfDay(new Date(`${calendar.start}T00:00:00`))
    return today > calendarStart ? today : calendarStart
  }

  const isDateSelectable = (date: Date) => {
    const minSelectable = getMinSelectableDate()
    const end = endOfDay(new Date(`${calendar.end}T00:00:00`))
    return date >= minSelectable && date <= end
  }
  
  // Navega para visualização do evento
  const handleSelectEvent = (event: BigCalendarEvent) => {
    navigate(`eventos/${event.id}/`, {state: event.id})
  }
  
  // Estilo dos eventos, bloqueando interação e mudando cursor em eventos passados
  const eventStyleGetter = (event: BigCalendarEvent) => {
    const backgroundColor = colorMap[event.type] || '#3174ad'

      const style: CSSProperties = {
        backgroundColor,
        borderRadius: '5px',
        color: 'white',
        border: 'none',
        padding: '2px 5px',
        opacity: 1,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }

      return {
        className: styles.clickableEvent,
        style,
      }
  }

  const dayPropGetter = (date: Date) => {
    if (!isDateSelectable(date)) {
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
