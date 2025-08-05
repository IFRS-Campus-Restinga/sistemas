from django.conf import settings
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from hub_users.models import *
from .token_service import TokenService
from hub_users.services.user_service import UserService, UserValidationException
from hub_users.services.password_service import PasswordService

GOOGLE_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_ID

class UserAuthException(Exception):
    pass

class UserAuthenticationService:
    @staticmethod
    def login():
        pass 

class CommonLogin(UserAuthenticationService):
    @staticmethod
    def check_login(user):
        password = Password.objects.get(user=user)

        if not password:
            raise UserAuthException('Método de login inválido para esta conta')

    @staticmethod
    def login(email: str, password: str) -> tuple[any, RefreshToken, AccessToken]:
        user = CustomUser.objects.get(email=email)

        CommonLogin.check_login(user)

        if CustomUser.DoesNotExist:
            raise UserValidationException('Usuário não existe')
        
        if not user.is_active:
            raise UserAuthException({'message': 'Conta inativa, contate seu administrador', 'is_active': user.is_active})
        
        if not PasswordService.check(user, password):
            raise UserValidationException('Senha inválida')
        
        user_data = UserService.build_user_data(user)
                
        token = TokenService.pair_token(user)
        
        return user_data, token, token.access_token
    

class GoogleLogin(UserAuthenticationService):
    @staticmethod
    def check_login(user):
        password = Password.objects.filter(user=user).first()

        if password:
            raise UserAuthException('Método de login inválido para esta conta')

    @staticmethod
    def login(credential: str, access_profile: str) -> tuple[any, str, str] :

        try:
            idinfo = id_token.verify_oauth2_token(credential, google_requests.Request(), GOOGLE_CLIENT_ID)

            email = idinfo.get('email', None)
            first_name = idinfo.get('given_name', None)
            last_name = idinfo.get('family_name', None)
            picture = idinfo.get('picture', None)

            user, created = UserService.create_user(email, first_name, last_name, access_profile)

            GoogleLogin.check_login(user)

            if not CustomUser.objects.filter(access_profile=access_profile).exists():
                raise UserValidationException("Grupo de acesso inválido para esta conta")

            if created:
                if access_profile != 'aluno':
                    return None, None, None
                
                user.is_active = True
                user.is_abstract = False

                user.save()
                
            if user.is_active:
                user_data = UserService.build_user_data(user, picture)
                
                access, refresh = TokenService.pair_token(user)

                return user_data, refresh, access
            else:
                raise UserAuthException({'message': 'Conta inativa, contate seu administrador', 'is_active': user.is_active}) 
        except Group.DoesNotExist as e:
            raise UserValidationException('Grupo de acesso não encontrado')
        except GoogleAuthError as e:
            raise UserValidationException(str(e))

