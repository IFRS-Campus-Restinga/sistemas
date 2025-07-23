import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from hub_calendars.models.calendar import Calendar
from hub_calendars.models.event import Event
from hub_calendars.enums.event_types import EventTypes
from hub_users.enums.categories import Categories
from hub_calendars.enums.calendar_status import CalendarStatus

# Cria o calendário principal
calendar = Calendar.objects.create(
    title="Calendário Acadêmico IFRS Restinga 2025",
    start=datetime(2025, 1, 1),
    end=datetime(2025, 12, 31),
    status=CalendarStatus.ATIVO  # ajuste conforme sua enum
)

# Define eventos com base no PDF
eventos = [
    {
        "title": "Confraternização Universal",
        "start": "2025-01-01",
        "end": "2025-01-01",
        "type": EventTypes.FERIADOS_N_LETIVO,
    },
    {
        "title": "Férias docentes",
        "start": "2025-01-06",
        "end": "2025-02-07",
        "type": EventTypes.RECESSO_ESC_FERIAS,
    },
    {
        "title": "Rematrícula online",
        "start": "2025-01-27",
        "end": "2025-02-05",
        "type": EventTypes.DIAS_LETIVOS,
    },
    {
        "title": "Início das aulas",
        "start": "2025-02-13",
        "end": "2025-02-13",
        "type": EventTypes.SEMANA_PEDAGOGICA,
    },
    {
        "title": "Carnaval",
        "start": "2025-03-03",
        "end": "2025-03-04",
        "type": EventTypes.FERIADOS_N_LETIVO,
    },
    {
        "title": "Semana Pedagógica e Planejamento",
        "start": "2025-07-28",
        "end": "2025-07-28",
        "type": EventTypes.SEMANA_PEDAGOGICA,
    },
    {
        "title": "Vestibular de Verão",
        "start": "2025-12-06",
        "end": "2025-12-07",
        "type": EventTypes.VESTIBULAR,
    },
    {
        "title": "Recesso Escolar",
        "start": "2025-12-08",
        "end": "2025-12-31",
        "type": EventTypes.RECESSO_ESC_FERIAS,
    },
    {
        "title": "Prazo final para registro de notas",
        "start": "2025-12-15",
        "end": "2025-12-15",
        "type": EventTypes.PRAZO_FIM_NOTAS_DOC,
    },
    {
    "title": "Curso Guia de Turismo - Recesso",
    "start": "2025-06-30",
    "end": "2025-07-25",
    "type": EventTypes.RECESSO_ESC_FERIAS,
    },
    {
        "title": "Conselhos de Classe Finais",
        "start": "2025-12-16",
        "end": "2025-12-22",
        "type": EventTypes.CONSELHOS_CLASSE,
    },
]

# Criar os eventos
for ev in eventos:
    Event.objects.create(
        title=ev["title"],
        start=datetime.strptime(ev["start"], "%Y-%m-%d"),
        end=datetime.strptime(ev["end"], "%Y-%m-%d"),
        type=ev["type"],
        category=Categories.GERAL,  # Ajuste conforme suas categorias
        description="",
        calendar=calendar
    )

print("Calendário e eventos criados com sucesso.")
