from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from hub_users.models import *
from .token_service import TokenService
from hub_users.services.user_service import UserService
from hub_users.services.password_service import PasswordService

GOOGLE_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_ID

class CommonLogin:
    @staticmethod
    def check_login(user):
        password = Password.objects.get(user=user)

        if not password:
            raise serializers.ValidationError('Método de login inválido para esta conta')

    @staticmethod
    def login(email: str, password: str) -> tuple[any, RefreshToken, AccessToken]:
        user = get_object_or_404(CustomUser, email=email)

        CommonLogin.check_login(user)
        
        if not user.is_active:
            raise serializers.ValidationError('Conta inativa, contate seu administrador')
        
        if not PasswordService.check(user, password):
            raise serializers.ValidationError('Senha inválida')
        
        user_data = UserService.build_user_data(user)
                
        access, refresh = TokenService.pair_token(user)
        
        return user_data, access, refresh
    

class GoogleLogin:
    @staticmethod
    def check_login(user):
        password = Password.objects.filter(user=user).first()

        if password:
            raise serializers.ValidationError('Método de login inválido para esta conta')

    @staticmethod
    def login(credential: str, access_profile: str) -> tuple[any, str, str] :
            if not credential:
                raise serializers.ValidationError('Token necessário')
    
            if not access_profile:
                raise serializers.ValidationError('Necessário informar perfil de acesso')
            
            decoded_token = id_token.verify_oauth2_token(credential, google_requests.Request(), GOOGLE_CLIENT_ID)

            picture = decoded_token.pop('picture', None)

            token_data = {
                'first_name': decoded_token.get('given_name', None),
                'last_name': decoded_token.get('family_name', None),
                'email': decoded_token.get('email', None),
                'access_profile': access_profile
            }

            user, created = UserService.create_user(token_data)

            GoogleLogin.check_login(user)

            if user.access_profile != access_profile:
                raise serializers.ValidationError("Grupo de acesso inválido para esta conta")

            if created:
                if access_profile != 'aluno':
                    return None, None, None
                
                user.is_active = True
                user.is_abstract = False

                user.save()
                
            if not user.is_active:
                raise serializers.ValidationError({'message': 'Conta inativa, contate seu administrador', 'status': user.status})
            
            user_data = UserService.build_user_data(user, picture)
            
            access, refresh = TokenService.pair_token(user)

            return user_data, refresh, access

