import uuid
from datetime import date
from calendar import monthrange
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import serializers
from hub_calendars.models.event import Event
from hub_calendars.serializers.event_serializer import EventSerializer 

class EventService:
    @staticmethod
    def create(event_data):
        serializer = EventSerializer(data=event_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def edit(event_data, event_id):
        calendar = get_object_or_404(Event, pk=uuid.UUID(event_id))

        serializer = EventSerializer(instance=calendar, data=event_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def list_by_month(request, month, year):
        month = int(month)
        year = int(year)

        start_of_month = date(year, month, 1)
        end_of_month = date(year, month, monthrange(year, month)[1])

        events = Event.objects.filter(
            Q(start__lte=end_of_month) & Q(end__gte=start_of_month)
        )

        serializer = EventSerializer(instance=events, context={'request': request}, many=True)
        return serializer.data
        
    @staticmethod
    def get_event(request, event_id):
        event = get_object_or_404(Event, pk=uuid.UUID(event_id))

        serializer = EventSerializer(instance=event, context={'request': request})

        return serializer.data
