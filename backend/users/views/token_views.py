from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.services.token_service import *
from systems.managers.system_managers import *
from django.http import Http404

@api_view(['GET'])
def refresh_token(request):
    refresh = request.COOKIES.get('refresh_token', None)
    system = request.COOKIES.get('system', None)

    if not refresh:
        return Response({'message': 'Autenticação necessária'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        access = TokenService.refresh_token(refresh, system)

        if system:
            return Response({
                'access_token': str(access),
                'message': 'Token renovado'
            }, status=status.HTTP_200_OK)
        else:
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
        return Response({"message": str(e)}, status=status.HTTP_404_NOT_FOUND)
    except TokenValidationError as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def pair_token(request):
    system = request.GET.get('system', None)
    user = request.GET.get('user', None)

    try:
        access_token, refresh_token = TokenService.pair_token(user, system)

        return Response({'access': access_token, 'refresh': refresh_token}, status=status.HTTP_200_OK)
    except Http404 as e:
        return Response({'message': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
