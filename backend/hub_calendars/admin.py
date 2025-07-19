from django.contrib import admin
from .models.calendar import Calendar
from .models.event import Event
# Register your models here.
admin.site.register(Calendar)
admin.site.register(Event)