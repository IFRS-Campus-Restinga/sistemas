import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar as BigCalendar, dateFnsLocalizer, type Event as BigEvent } from 'react-big-calendar'
import { useEffect, useState } from 'react'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import EventService, { type EventInterface } from '../../../../services/eventService'
import CalendarService, { type CalendarInterface } from '../../../../services/calendarService'
import FormContainer from '../../../../components/formContainer/FormContainer'
import CustomLoading from '../../../../components/customLoading/CustomLoading'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

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
  const [calendar, setCalendar] = useState<CalendarInterface>()
  const [events, setEvents] = useState<BigCalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Para carregar eventos conforme o intervalo visível do calendário
  const fetchEvents = async (start: Date, end: Date) => {
    setIsLoading(true)
    try {
      // Como seu backend filtra por mês, vamos enviar mês e ano do start
      const month = start.getMonth() + 1
      const year = start.getFullYear()

      const res = await EventService.list(month, year)

      // Mapear os eventos do backend para o formato que o BigCalendar espera
      const mappedEvents = res.data.map((ev: EventInterface) => ({
        id: ev.id,
        title: ev.title,
        start: new Date(ev.start),
        end: new Date(ev.end),
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

  const fetchCalendar = async () => {
    try {
      const res = await CalendarService.get(state)
      setCalendar(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCalendar()
  }, [state])

  useEffect(() => {
    fetchEvents(new Date(today.getFullYear(), today.getMonth(), 1), new Date())
  }, [])

  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    let start: Date
    let end: Date

    if (Array.isArray(range)) {
      start = range[0]
      end = range[range.length - 1]
    } else {
      start = range.start
      end = range.end
    }

    fetchEvents(start, end)
  }

  const handleSelectEvent = (event: BigCalendarEvent) => {
    // Pode navegar para a tela de edição do evento, por exemplo
    navigate(`/eventos/${event.id}/editar`)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Só permite criar eventos em datas futuras
    if (slotInfo.start >= new Date(today.toDateString())) {
      navigate('/eventos/novo', {
        state: {
          calendarId: state,
          selectedDate: slotInfo.start.toISOString().split('T')[0],
        },
      })
    }
  }

  const eventStyleGetter = (event: BigCalendarEvent) => {
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

        const backgroundColor = colorMap[event.type] || '#3174ad'

        const isClickable = event.start! >= new Date(today.toDateString())

        return {
            style: {
            backgroundColor,
            borderRadius: '5px',
            color: 'white',
            border: 'none',
            padding: '2px 5px',
            cursor: isClickable ? 'pointer' : 'not-allowed',
            opacity: isClickable ? 1 : 0.5,  // opcional, para visual
            },
        }
    }

  if (isLoading || !calendar) return <CustomLoading />

  return (
    <FormContainer title={calendar.title} formTip="Clique em um espaço vazio para criar evento ou clique num evento para editar">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onRangeChange={handleRangeChange}
        selectable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventStyleGetter}
        min={today} // bloqueia datas antes de hoje
      />
    </FormContainer>
  )
}

export default Calendar
