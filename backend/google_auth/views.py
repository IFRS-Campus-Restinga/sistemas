import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken
from google_auth.models import CustomUser
from django.conf import settings

GOOGLE_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_SECRET

@api_view(['POST'])
def login(request):
    token = request.data.get('token', None)

    if not token:
        return Response({'message': 'Token necessário'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        if not email.endswith("@restinga.ifrs.edu.br") and not email.endswith("@aluno.restinga.ifrs.edu.br"):
            return Response({'message': 'Email não pertence à instituição'}, status=status.HTTP_403_FORBIDDEN)

        user, created = CustomUser.objects.get_or_create(username=email, defaults={
            "email": email,
            "first_name": first_name,
            "last_name": last_name
        })

        if created:
            if email.endswith("@aluno.restinga.ifrs.edu.br"):
                group, _ = Group.objects.get_or_create(name='aluno')
            elif email.endswith('@restinga.ifrs.edu.br'):
                group, _ = Group.objects.get_or_create(name='servidor')
            
            user.groups.add(group)

        # Gera tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'group': user.groups.first().name if user.groups.exists() else None
            }
        })

    except ValueError:
        return Response({'message': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
