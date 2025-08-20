import uuid
from rest_framework import serializers
from hub_calendars.models.calendar import Calendar
from hub_calendars.serializers.calendar_serializer import CalendarSerializer
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination
from hub_calendars.services.event_service import EventService

class CalendarPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

class CalendarService:
    @staticmethod
    def create(calendar_data):
        serializer = CalendarSerializer(data=calendar_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def edit(calendar_data, calendar_id):
        calendar = get_object_or_404(Calendar, pk=uuid.UUID(calendar_id))

        serializer = CalendarSerializer(instance=calendar, data=calendar_data)

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()

    @staticmethod
    def list_calendars(request):
        status = request.GET.get('status', None)

        calendars = Calendar.objects.filter(title__icontains=request.GET.get('search', ''))

        if status:
            calendars = calendars.filter(status=status)
        
        if not calendars.exists():
            paginator = CalendarPagination()
            paginated_result = paginator.paginate_queryset([], request)
            return paginator.get_paginated_response(paginated_result)
        
        paginator = CalendarPagination()
        paginated_result = paginator.paginate_queryset(calendars, request)

        serializer = CalendarSerializer(paginated_result, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)

    @staticmethod
    def get_calendar(request, calendar_id):
        calendar = get_object_or_404(Calendar, pk=uuid.UUID(calendar_id))

        serializer = CalendarSerializer(instance=calendar, context={'request': request})

        return serializer.data


