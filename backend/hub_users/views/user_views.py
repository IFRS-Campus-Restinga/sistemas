import logging
from datetime import datetime
from jwt.exceptions import ExpiredSignatureError
from fs_auth_middleware.decorators import has_permissions
from django.conf import settings
from django.http import Http404
from rest_framework import status, serializers
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from hub_users.services.user_service import *
from hub_users.services.email_confirmation_service import EmailConfirmationService
from hub_users.services.request_service import AccessRequestService
from hub_auth.services.token_service import *
from hub_users.models import User
from ..utils.format_validation_errors import format_validation_errors
from ..serializers.user_serializer import UserSerializer
from ..serializers.email_confirmation_serializer import EmailConfirmationSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
def create_account_visitor(request):
    try:
        user = UserService.create_visitor_account(request.data)

        return Response({
            'message': 'Conta criada com sucesso',
            'confirmation_id': str(user.email_confirmation.pk),
        }, status=status.HTTP_201_CREATED)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao cadastrar usuário", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_email(request, confirmation_id):
    try:
        serializer = EmailConfirmationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        EmailConfirmationService.confirm(
            confirmation_id,
            serializer.validated_data['confirmation_code'],
        )
        return Response(
            {'message': 'Email confirmado com sucesso'},
            status=status.HTTP_200_OK,
        )
    except serializers.ValidationError as e:
        return Response({'message': e.detail}, status=status.HTTP_400_BAD_REQUEST)
    except Http404:
        return Response(
            {'message': 'Confirmação não encontrada'},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao confirmar email", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
def regenerate_email_confirmation(request, confirmation_id):
    try:
        EmailConfirmationService.regenerate(confirmation_id)
        return Response(
            {
                'message': (
                    'Um novo código foi gerado e tem validade de 10 minutos. '
                    'O envio de email ainda não está configurado.'
                )
            },
            status=status.HTTP_200_OK,
        )
    except Http404:
        return Response(
            {'message': 'Confirmação não encontrada'},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(
            f"[{timestamp}] Erro inesperado ao gerar novo código de confirmação",
            exc_info=True,
        )
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@has_permissions(['view_user'])
def get_user(request, user_id):
    try:
        user_data = UserService.get(request, user_id)

        return Response(user_data, status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter dados do usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions([])
def get_data(request):
    try:
        access_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME, None)

        if not access_token:
            return Response({'message': 'Sem credencial de acesso'}, status=status.HTTP_401_UNAUTHORIZED)

        payload = TokenService.decode_token(access_token)

        user = get_object_or_404(User, pk=uuid.UUID(payload.get('user_id', None)))

        return Response(UserService.build_user_data(user), status=status.HTTP_200_OK)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except (ExpiredSignatureError, TokenValidationError) as e:
        return Response({'message': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao obter estado do usuário", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@has_permissions(['view_user'])
def list_users_by_access_profile(request, access_profile_name):
    try:
        return UserService.list_by_access_profile(request, access_profile_name)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar usuários por perfil", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_user'])
def list_users_by_group(request, group_name):
    try:
        return UserService.list_by_group(request, group_name)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar usuários por grupo", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@has_permissions(['view_user'])
def list_access_requests(request):
    try:
        return AccessRequestService.list(request)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao listar requisições de acesso", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
@has_permissions(['change_user'])
def approve_access_request(request, request_id):
    try:
        AccessRequestService.approve(request.data, request_id)

        return Response({'message': 'Conta ativada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Solicitação de acesso não encontrada"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao aprovar solicitação de acesso {request_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@has_permissions(['change_user'])
def edit_user(request, user_id):
    try:
        UserService.edit(request, user_id)

        return Response({'message': 'Conta atualizada com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except serializers.ValidationError as e:
        return Response({'message': format_validation_errors(e.detail, UserSerializer)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao editar usuário {user_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@has_permissions(['delete_user'])
def decline_access_request(_, request_id):
    try:
        AccessRequestService.reject(request_id)

        return Response({'message': 'Solicitação excluída com sucesso'}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Solicitação de acesso não encontrada"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao excluir solicitação de acesso {request_id}", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)