from rest_framework.decorators import api_view
from hub_auth.services.auth_service import *
from rest_framework.response import Response
from rest_framework import status
from fs_auth_middleware.decorators import is_authenticated

@api_view(['POST'])
def login_with_google(request):
    credential = request.data.get('credential', None)
    access_profile = request.data.get('accessProfile', None)

    if not credential:
        return Response({'message': 'Token necessário'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not access_profile:
        return Response({'message': 'Necessário informar perfil de acesso'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_data, refresh, access = GoogleLogin.login(credential, access_profile)

        response = Response({'user': user_data}, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=refresh,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=3600*24*7,
            path='/session/'
        )

        response.set_cookie(
            key='access_token',
            value=access,
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/'
        )

        return response
    except UserAuthException as e:
        return Response(e.args[0], status=status.HTTP_403_FORBIDDEN)
    except UserValidationException  as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
def login(request):
    try:
        email = request.data.get('email', None)
        password = request.data.get('password', None)

        if not email:
            return Response({'message': 'Email deve ser informado no login'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'message': 'Senha deve ser informada no login'}, status=status.HTTP_400_BAD_REQUEST)

        user_data, refresh, access = CommonLogin.login(email, password)

        response = Response({'user': user_data}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=3600 * 24 * 7,
            path="/session/",
            domain='127.0.0.1'
        )

        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            domain='127.0.0.1'
        )

        return response
    except UserAuthException as e:
        return Response(e.args[0], status=status.HTTP_403_FORBIDDEN)
    except UserValidationException  as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@is_authenticated()
def logout(request):
    try:
        response = Response({'message': 'Logout concluído com sucesso'}, status=status.HTTP_200_OK)

        response.delete_cookie('refresh_token')
        response.delete_cookie('access_token')

        return response
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
