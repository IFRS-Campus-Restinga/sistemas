import uuid
from django.db import models
from hub_calendars.enums.calendar_status import CalendarStatus

class Calendar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=20)
    start = models.DateField()
    end = models.DateField()
    status = models.CharField(choices=CalendarStatus.choices, max_length=10)