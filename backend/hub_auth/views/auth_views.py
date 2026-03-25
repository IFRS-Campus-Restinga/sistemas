import logging
from django.http import Http404
from django.conf import settings
from datetime import datetime
from rest_framework.decorators import api_view
from hub_auth.services.auth_service import *
from rest_framework.response import Response
from rest_framework import status
from google.auth.exceptions import GoogleAuthError
from ..utils.format_validation_errors import format_validation_errors

logger = logging.getLogger(__name__)

@api_view(['POST'])
def login_with_google(request):
    credential = request.data.get('credential', None)
    access_profile = request.data.get('accessProfile', None)
    system = request.GET.get('system', None)
    
    try:
        user_data, refresh, access = GoogleLogin.login(credential, access_profile)

        response = Response({'user': user_data}, status=status.HTTP_200_OK)
        
        if not system:
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
                path=settings.AUTH_COOKIE_REFRESH_PATH
            )

            response.set_cookie(
                key='access_token',
                value=access,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_ACCESS_PATH
            )

        return response
    except (serializers.ValidationError, GoogleAuthError, ValueError)  as e:
        return Response({'message': format_validation_errors(e.detail)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao autenticar com google", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
def login(request):
    try:
        email = request.data.get('email', None)
        password = request.data.get('password', None)
        system = request.GET.get('system', None)

        if not email:
            return Response({'message': 'Email deve ser informado no login'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'message': 'Senha deve ser informada no login'}, status=status.HTTP_400_BAD_REQUEST)

        user_data, refresh, access = CommonLogin.login(email, password)

        response = Response({'user': user_data}, status=status.HTTP_200_OK)

        if not system:
            response.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
                path=settings.AUTH_COOKIE_REFRESH_PATH,
            )

            response.set_cookie(
                key="access_token",
                value=access,
                httponly=settings.AUTH_COOKIE_HTTPONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_ACCESS_PATH,
            )

        return response
    except serializers.ValidationError  as e:
        return Response({'message': format_validation_errors(e.detail)}, status=status.HTTP_400_BAD_REQUEST)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"})
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao autenticar", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
def logout(request):
    try:
        response = Response({'message': 'Logout concluído com sucesso'}, status=status.HTTP_200_OK)

        response.delete_cookie("refresh_token", path=settings.AUTH_COOKIE_REFRESH_PATH)
        response.delete_cookie('access_token', path=settings.AUTH_COOKIE_ACCESS_PATH)

        return response
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao encerrar sessão", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
