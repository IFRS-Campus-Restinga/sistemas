from django.http import Http404
from rest_framework import serializers, status
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_every_permission
from rest_framework.response import Response
from ..services.event_service import EventService

@api_view(['POST'])
@has_every_permission(['add_event'])
def create_event(request):
    try:
        event = EventService.create(request.data)

        return Response({'message': 'Evento criado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_every_permission(['view_event'])
def list_events(request):
    try:
        events = EventService.list_by_month(request, request.GET.get('month', None), request.GET.get('year', None))

        return Response(events, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@has_every_permission(['view_event'])
def get_event(request, event_id):
    try:
        event = EventService.get_event(request, event_id)

        return Response(event, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT', 'PATCH'])
@has_every_permission(['change_event'])
def edit_event(request, event_id):
    try:
        EventService.edit(request.data, event_id)

        return Response({'message': 'Evento atualizado com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['DELETE'])
@has_every_permission(['delete_event'])
def delete_event(request, event_id):
    pass
