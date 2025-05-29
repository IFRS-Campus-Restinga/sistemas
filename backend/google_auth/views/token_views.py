import uuid
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from jwt import decode as jwt_decode
from django.conf import settings
from django.contrib.auth import get_user_model
from google_auth.models import Permission

User = get_user_model()

@api_view(['POST'])
def validate_token(request):
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return Response(
            {"detail": "Cabeçalho de autorização inválido ou ausente."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token = auth_header.split(' ')[1]

    try:
        access_token = AccessToken(token)

        # Extrai ID do usuário do token
        user_id = access_token.get('user_id')
        user = User.objects.get(id=uuid.UUID(user_id))

        # verifica se o usuário possui as permissões que constam no token
        user_permissions = access_token.get('permissions')

        for permission_name in user_permissions:
            Permission.objects.get(name=permission_name, custom_user=user)

        # Gera novo refresh token com claims personalizados
        refresh = RefreshToken.for_user(user)
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['group'] = user.group.name if hasattr(user, 'group') else ''
        refresh['permissions'] = [perm.name for perm in user.permissions.all()]

        # Decodifica payload do access token
        payload = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        response = Response({"valid": True, "payload": payload}, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=24 * 60 * 60
        )

        return response
    
    except Permission.DoesNotExist:
        return Response({"message": "Lista de permissões inválida"}, status=status.HTTP_401_UNAUTHORIZED)

    except User.DoesNotExist:
        return Response({"message": "Usuário não encontrado."}, status=status.HTTP_401_UNAUTHORIZED)

    except (TokenError, InvalidToken) as e:
        return Response({"message": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({"message": "Token inválido ou expirado."}, status=status.HTTP_401_UNAUTHORIZED)
