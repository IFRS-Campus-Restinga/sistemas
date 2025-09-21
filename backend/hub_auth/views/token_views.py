import logging
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from hub_auth.services.token_service import *
from django.http import Http404

logger = logging.getLogger(__name__)

@api_view(['GET'])
def refresh_token(request):
    refresh = request.COOKIES.get('refresh_token', None)

    if not refresh:
        return Response({'message': 'Autenticação necessária'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        access = TokenService.refresh_token(refresh)

        response = Response({'message': 'Token renovado'}, status=status.HTTP_200_OK)
        response.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/'
        )
        return response

    except Http404 as e:
        return Response({"message": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except TokenValidationError as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao renovar token", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def pair_token(request):
    user = request.GET.get('user', None)

    try:
        if not user:
            return Response({'message': 'Autenticação necessária'}, status=status.HTTP_401_UNAUTHORIZED)
    
        access_token, refresh_token = TokenService.pair_token(user)

        return Response({'access': access_token, 'refresh': refresh_token}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.error(f"[{timestamp}] Erro inesperado ao gerar par de tokens", exc_info=True)
        return Response({'message': "Ocorreu um erro"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
