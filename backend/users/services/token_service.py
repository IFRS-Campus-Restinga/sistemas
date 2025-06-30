import uuid
import jwt
from django.shortcuts import get_object_or_404
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from users.models import CustomUser
from systems.models.system import System
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

class TokenValidationError(Exception):
    pass

class TokenMetadataService:
    @staticmethod
    def get(user: CustomUser) -> dict:

        return {
            'groups': [group.name for group in user.groups.all()],
            'permissions': CustomUser.objects.get_permissions(str(user.id))
        }
    
class TokenValidationService:
    @staticmethod
    def validate_groups(user: CustomUser, token_groups: set[str]):
        groups = set(group.name for group in user.groups.all())

        if groups != token_groups:
            raise TokenValidationError("Grupos inválidos")

    @staticmethod
    def validate_permissions(user: CustomUser, token_permissions: list[str]):
        permissions = set(CustomUser.objects.get_permissions(str(user.id)))

        if permissions != token_permissions:
            raise TokenValidationError("Permissões inválidas")

    @staticmethod
    def validate(payload, system_id) -> CustomUser:
        """Verifica se os dados do token constam no banco de dados"""
        token = payload

        try:
            user_id = uuid.UUID(token["user_id"])

            user = CustomUser.objects.get(id=user_id)
        except (KeyError, ValueError, TypeError):
            raise TokenValidationError("Usuário inválido no token")
        except CustomUser.DoesNotExist:
            raise TokenValidationError("Usuário não encontrado")
        
        token_groups = set(token['groups'])
        TokenValidationService.validate_groups(user, token_groups)

        if not system_id:
            token_permissions = set(token.get("permissions", []))
            TokenValidationService.validate_permissions(user, token_permissions)
        
        return user

class TokenService:
    @staticmethod
    def pair_token(user: str | CustomUser, system_id: str | None = None) -> tuple[str, str, CustomUser]:
        """Retorna um par de tokens (refresh/access) sendo o access token opcionalmente assinado com a SECRET_KEY do sistema de destino caso informado"""
        if not isinstance(user, CustomUser):
            user = get_object_or_404(CustomUser, pk=uuid.UUID(user))
        
        metadata = TokenMetadataService.get(user)
        now = datetime.now(timezone.utc)

        secret = settings.SECRET_KEY
        refresh_exp = now + timedelta(days=7)
        
        if system_id:
            secret = get_object_or_404(System, pk=uuid.UUID(system_id)).secret_key

            refresh_exp = now + timedelta(days=1)

        access_payload = {
            'iat': now,
            'exp': now + timedelta(minutes=5),
            'user_id': str(user.id),
            **metadata,
        }

        refresh_payload = {
            'iat': now,
            'exp': refresh_exp,
            'user_id': str(user.id),
            **metadata,
        }

        access_token = jwt.encode(access_payload, secret, algorithm="HS256")
        refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm="HS256")

        return str(access_token), str(refresh_token)

    @staticmethod
    def refresh_token(refresh_token: str, system_id: str | None = None) -> tuple[str, CustomUser]:
        """Cria um JWT assinado com a `secret_key` do sistema de destino."""
        
        secret = settings.SECRET_KEY
        payload = TokenService.decode_token(refresh_token)
        
        TokenValidationService.validate(payload, system_id)

        if system_id:
            secret = get_object_or_404(System, pk=uuid.UUID(system_id)).secret_key

        now = datetime.now(timezone.utc)
        exp = now + timedelta(minutes=5)

        token_payload = {
            'iat': now,
            'exp': exp,
            **payload,
        }

        access_token = jwt.encode(token_payload, secret, algorithm='HS256')

        return access_token

    @staticmethod
    def decode_token(token: str) -> tuple[dict, str]:
        """Decodifica o refresh_token recebido, retornando o payload"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

            return payload
        except InvalidTokenError as e:
            raise ValueError("Token inválido ou chave inválida.") from e