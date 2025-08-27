import uuid
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from rest_framework import status, serializers
from hub_systems.models import System
from hub_systems.services import SystemService, SystemException
from hub_auth.services.token_service import TokenService

@api_view(['POST'])
@has_permissions(['add_system', 'add_group'])
def create(request):
    try:
        SystemService.create(request.data)

        return Response({'message': 'Sistema cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)
    except (serializers.ValidationError, SystemException) as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_system'])
def get(request, system_id):
    try:
        system = SystemService.get_data(request, system_id)

        return Response(system, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_system'])
def get_api_key(request, system_id):
    try:
        api_key = SystemService.get_api_key(request, system_id)

        if api_key == None:
            return Response({'message': "Acesso negado"}, status=status.HTTP_403_FORBIDDEN)

        return Response(api_key, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def validate(request, api_key):
    try:
        get_object_or_404(System, api_key=api_key)

        return Response({'message': "Sistema válido"}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str (e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_system'])
def menu_list(request):
    try:
        return SystemService.get_menu(request)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions(['change_system', 'add_group'])
def edit(request, system_id):
    try:
        SystemService.edit(request.data, system_id)

        return Response({'message': "sistema atualizado com sucesso"}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
