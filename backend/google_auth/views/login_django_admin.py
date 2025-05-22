from django.shortcuts import redirect
from django.conf import settings
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from django.contrib.auth import login as auth_login
from google_auth.models import CustomUser
from django.contrib import messages
from google.auth.transport import requests

GOOGLE_OAUTH2_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_ID
GOOGLE_OAUTH2_CLIENT_SECRET = settings.GOOGLE_OAUTH2_CLIENT_SECRET
REDIRECT_URI = settings.REDIRECT_URI
BASE_DIR = settings.BASE_DIR

def admin_login(request):
    flow = Flow.from_client_secrets_file(
        f'{BASE_DIR}/credentials/client_secret.json',
        scopes=[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid',
        ],
        redirect_uri=REDIRECT_URI
    )

    authorization_url, state = flow.authorization_url(access_type='offline')
    request.session['state'] = state
    return redirect(authorization_url)

def google_callback(request):
    flow = Flow.from_client_secrets_file(
        f'{BASE_DIR}/credentials/client_secret.json',
        scopes=[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid',
        ],
        state=request.session['state'],
        redirect_uri=settings.REDIRECT_URI
    )

    flow.fetch_token(authorization_response=request.build_absolute_uri())
    credentials = flow.credentials

    id_info = id_token.verify_oauth2_token(credentials.id_token, requests.Request(), settings.GOOGLE_OAUTH2_CLIENT_ID)

    email = id_info['email']
    name = id_info.get('name')

    user, created = CustomUser.objects.get_or_create(email=email, defaults={'nome': name})

    user.is_superuser = True  # Permite todas as permissões
    user.is_staff = True
    user.save()

    auth_login(request, user)

    messages.success(request, 'Login realizado com sucesso!')
    return redirect('admin:index')  # Redireciona para o Django Admin