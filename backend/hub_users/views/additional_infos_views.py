import logging
from datetime import datetime
from fs_auth_middleware.decorators import has_permissions
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hub_users.services.additional_infos_service import *
from ..utils.format_validation_errors import format_validation_errors
from ..serializers.additional_infos_serializer import AdditionalInfosSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
@has_permissions(['add_additionalinfos'])
def create_additional_infos(request):
    try:
        AdditionalInfosService.create(request)

        return Response({'message': 'Dados adicionados com sucesso'}, status=status.HTTP_201_CREATED)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, AdditionalInfosSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except AccessDeniedException as e:
        return Response({'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar informações adicionais do usuário {request.data.get('user', None)}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_additionalinfos'])
def get_additional_infos(request, user_id):
    try:
        additional_infos = AdditionalInfosService.get(request, user_id)

        return Response(additional_infos, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, AdditionalInfosSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except AccessDeniedException as e:
        return Response({'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except Http404 as e:
        return Response({'message': "Nenhuma informação adicional vinculada a este usuário foi encontrada"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter informações adicionais do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions(['change_additionalinfos'])
def edit_additional_infos(request, user_id):
    try:
        AdditionalInfosService.edit(request, user_id)

        return Response({'message': 'Dados atualizados com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, AdditionalInfosSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except AccessDeniedException as e:
        return Response({'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except Http404 as e:
        return Response({'message': "Nenhuma informação adicional encontrada"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao atualizar informações adicionais do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)