import ListPage from '../../../../features/listPage/ListPage'
import CalendarService from '../../../../services/calendarService'

const translations = {
    "id": "id",
    "title": "título",
    "start": "início",
    "end": "fim",
    "status": "status"
}

const CalendarList = () => {
    const fetchCalendars = async (currentPage: number, searchParam: string) => {
        const res = await CalendarService.list(currentPage, searchParam, 'id, title, start, end, status')

        return {
            next: res.data.next,
            previous: res.data.previous,
            data: res.data.results
        }
    }

    const deleteCalendar = async (calendarId: string) => {

    }

    return (
        <ListPage
            title='Calendários'
            fetchData={fetchCalendars}
            registerUrl='/session/admin/calendarios/create/'
            canEdit={true}
            canView={true}
            onDelete={deleteCalendar}
            translations={translations}
        />
    )
}

export default CalendarList