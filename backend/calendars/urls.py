from django.urls import path
from .views.calendar_views import *
from .views.event_views import *

urlpatterns = [
    # calendar views
    path('create/', create_calendar),
    path('get/', list_calendars),
    path('get/<str:calendar_id>/', get_calendar),
    path('edit/<str:calendar_id>/', edit_calendar),
    path('delete/<str:calendar_id>/', delete_calendar),

    # event views
    path('event/create/', create_event),
    path('event/get/', list_events),
    path('event/get/<str:event_id>/', get_event),
    path('event/edit/<str:event_id>/', edit_event),
    path('event/delete/<str:event_id>/', delete_event),
]
