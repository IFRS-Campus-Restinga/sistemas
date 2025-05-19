from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken
from google_auth.models import CustomUser
from django.conf import settings

GOOGLE_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_ID

from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    token = request.data.get('credential', None)

    if not token:
        return Response({'message': 'Token necessário'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        if not email.endswith("@restinga.ifrs.edu.br") and not email.endswith("@aluno.restinga.ifrs.edu.br"):
            return Response({'message': 'Email não pertence à instituição'}, status=status.HTTP_403_FORBIDDEN)

        user, created = CustomUser.objects.get_or_create(email=email, defaults={
            "first_name": first_name,
            "last_name": last_name
        })

        if created:
            if email.endswith("@aluno.restinga.ifrs.edu.br"):
                group, _ = Group.objects.get_or_create(name='aluno')
            else:
                group, _ = Group.objects.get_or_create(name='servidor')

            user.group = group
            user.save()

        # Gera token com dados personalizados
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['group'] = user.group.name

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

    except ValueError as e:
        return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
