import logging
from datetime import datetime
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from fs_auth_middleware.decorators import has_permissions
from rest_framework.response import Response
from .service import PermissionService
from .utils.format_validation_errors import format_validation_errors
from .serializer import PermissionSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@has_permissions(['view_permission'])
def list_permissions(request):
    try:
        return PermissionService.list(request)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PermissionSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar permissões", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_permission'])
def list_by_group(request, group_id):
    try:
        return PermissionService.list_by_group(request, group_id)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PermissionSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Grupo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar permissões do grupo {group_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_group', 'view_permission'])
def get_not_assigned_permissions(request, group_id):
    try:
        return PermissionService.get_not_assigned_to_group(request, group_id)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, PermissionSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Grupo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar permissões disponíveis para o grupo {group_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)