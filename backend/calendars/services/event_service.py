import uuid
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import serializers
from calendars.models.event import Event
from calendars.serializers.event_serializer import EventSerializer 

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
        events = Event.objects.filter(
            Q (start__month=month, start__year=year) | Q (end__month=month, end__year=year)
        )

        serializer = EventSerializer(instance=events, context={'request': request}, many=True)

        return serializer.data
    
    @staticmethod
    def get_event(request, event_id):
        event = get_object_or_404(Event, pk=uuid.UUID(event_id))

        serializer = EventSerializer(instance=event, context={'request': request})

        return serializer.data
