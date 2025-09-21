import uuid
from django.db import models
from hub_calendars.models.calendar import Calendar
from hub_calendars.enums.event_types import EventTypes
from hub_users.enums.categories import Categories

class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=30,verbose_name="Título")
    start = models.DateField(verbose_name="Início")
    end = models.DateField(verbose_name="Fim")
    type = models.CharField(choices=EventTypes.choices, max_length=60, verbose_name="Tipo")
    category = models.CharField(choices=Categories.choices, max_length=10, verbose_name="Categoria")
    description = models.TextField(max_length=300, verbose_name="Descrição")
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, verbose_name="Calendário")
