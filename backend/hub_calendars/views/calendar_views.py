from django.http import Http404
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from ..services.calendar_service import CalendarService

@api_view(['POST'])
@has_permissions(['add_calendar'])
def create_calendar(request):
    try:
        calendar = CalendarService.create(request.data)

        return Response({'message': 'Calendário criado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@has_permissions(['view_calendar'])
def list_calendars(request):
    try:
        return CalendarService.list_calendars(request)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@has_permissions(['view_calendar'])
def get_calendar(request, calendar_id):
    try:
        calendar = CalendarService.get_calendar(request, calendar_id)

        return Response(calendar, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@has_permissions(['change_calendar'])
def edit_calendar(request, calendar_id):
    try:
        CalendarService.edit(request.data, calendar_id)

        return Response({'message': 'Calendário atualizado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@has_permissions(['delete_calendar'])
def delete_calendar(request, group_id):
    pass
