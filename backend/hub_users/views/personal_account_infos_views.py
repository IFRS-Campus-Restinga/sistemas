import logging
from datetime import datetime
from fs_auth_middleware.decorators import has_permissions
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hub_users.services.personal_account_infos_service import (
    AccessDeniedException,
    PersonalAccountInfosService,
)
logger = logging.getLogger(__name__)

@api_view(['POST'])
@has_permissions(['add_personalinfos', 'add_accountinfos'])
def create_personal_account_infos(request):
    try:
        PersonalAccountInfosService.create(request)

        return Response({'message': 'Dados adicionados com sucesso'}, status=status.HTTP_201_CREATED)
    except serializers.ValidationError:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_400_BAD_REQUEST)
    except AccessDeniedException:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar dados pessoais e da conta do usuário {request.data.get('user', None)}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_personalinfos', 'view_accountinfos'])
def get_personal_account_infos(request, user_id):
    try:
        personal_account_infos = PersonalAccountInfosService.get(request, user_id)

        return Response(personal_account_infos, status=status.HTTP_200_OK)
    except serializers.ValidationError:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_400_BAD_REQUEST)
    except AccessDeniedException:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN)
    except Http404:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter dados pessoais e da conta do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions([])
def edit_personal_account_infos(request, user_id):
    try:
        PersonalAccountInfosService.edit(request, user_id)

        return Response({'message': 'Dados atualizados com sucesso'}, status=status.HTTP_200_OK)
    except serializers.ValidationError:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_400_BAD_REQUEST)
    except AccessDeniedException:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_403_FORBIDDEN)
    except Http404:
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao atualizar dados pessoais e da conta do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)