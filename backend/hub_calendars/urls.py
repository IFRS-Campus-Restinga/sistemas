from django.urls import path
from .views.calendar_views import *
from .views.event_views import *

urlpatterns = [
    # calendar views
    path('create/', create_calendar),
    path('get/', list_calendars),
    path('get/<str:calendar_id>/', get_calendar),
    path('edit/<str:calendar_id>/', edit_calendar),

    # event views
    path('events/create/', create_event),
    path('events/get/', list_events),
    path('events/get/<str:event_id>/', get_event),
    path('events/edit/<str:event_id>/', edit_event),
]
