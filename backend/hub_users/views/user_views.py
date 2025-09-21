import logging
from datetime import datetime
from jwt.exceptions import ExpiredSignatureError
from fs_auth_middleware.decorators import has_permissions
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from hub_users.services.user_service import *
from hub_auth.services.token_service import *
from ..utils.format_validation_errors import format_validation_errors
from ..serializers.custom_user_serializer import CustomUserSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
def create_account_visitor(request):
    try:
        UserService.create_user(request.data)

        return Response({'message': 'Conta criada com sucesso'}, status=status.HTTP_201_CREATED)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar usuário", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_customuser'])
def get_user(request, user_id):
    try:
        user_data = UserService.get(request, user_id)

        return Response(user_data, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter dados do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_customuser'])
def get_data(request):
    try:
        access_token = request.COOKIES.get('access_token', None)

        if not access_token:
            return Response({'message': 'Sem credencial de acesso'}, status=status.HTTP_401_UNAUTHORIZED)

        payload = TokenService.decode_token(request.COOKIES.get('access_token', None))

        user = get_object_or_404(CustomUser, pk=uuid.UUID(payload.get('user_id', None)))

        return Response(UserService.build_user_data(user), status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except ExpiredSignatureError as e:
        return Response({'message': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter estado do usuário", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_customuser'])
def list_users_by_access_profile(request, access_profile_name):
    try:
        return UserService.list_by_access_profile(request, access_profile_name)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar usuários por perfil", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_customuser'])
def list_users_by_group(request, group_name):
    try:
        return UserService.list_by_group(request, group_name)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar usuários por grupo", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_customuser'])
def list_user_requests(request):
    try:
        return UserService.get_requests(request)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar requisições de acesso", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions(['change_customuser'])
def approve_user_request(request, user_id):
    try:
        UserService.approve_request(request.data, user_id)

        return Response({'message': 'Conta ativada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao aprovar requisição de acesso do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@has_permissions(['change_customuser'])
def edit_user(request, user_id):
    try:
        UserService.edit(request, user_id)

        return Response({'message': 'Conta atualizada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, CustomUserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao editar usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@has_permissions(['delete_customuser'])
def decline_user_request(_, user_id):
    try:
        UserService.decline_request(user_id)

        return Response({'message': 'Conta ativada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao excluir requisição de acesso do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)