import logging
from datetime import datetime
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from rest_framework import status, serializers
from hub_systems.models import System
from hub_systems.services import SystemService
from .utils.format_validation_errors import format_validation_errors
from .serializer import SystemSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
@has_permissions(['add_system', 'add_group'])
def create_system(request):
    try:
        SystemService.create(request.data)

        return Response({'message': 'Sistema cadastrado com sucesso!'}, status=status.HTTP_201_CREATED)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, SystemSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar sistema", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_system'])
def get_system(request, system_id):
    try:
        system = SystemService.get_data(request, system_id)

        return Response(system, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, SystemSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Sistema não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter sistema {system_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def validate_system(request, api_key):
    try:
        get_object_or_404(System, api_key=api_key)

        return Response({'message': "Sistema válido"}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Sistema não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao validar sistema {api_key}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_system'])
def list_systems(request):
    try:
        return SystemService.list(request)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, SystemSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar sistemas", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions(['change_system', 'add_group'])
def edit_system(request, system_id):
    try:
        SystemService.edit(request.data, system_id)

        return Response({'message': "sistema atualizado com sucesso"}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, SystemSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Sistema não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao editar sistema {system_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  
