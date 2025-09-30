import uuid
from .models import System
from hub_auth.services.token_service import TokenService
from django.shortcuts import get_object_or_404

class URLFieldsParser:
    @staticmethod
    def build_field_map(fields: list[str]) -> dict:
        field_map: dict = {}
        for field in fields:
            parts = field.split(".")
            current = field_map
            for i, part in enumerate(parts):
                if i == len(parts) - 1:
                    current[part] = True
                else:
                    current = current.setdefault(part, {})
        return field_map
    
    @staticmethod
    def get_api_key(request, system_id):
        payload = TokenService.decode_token(request.COOKIES.get("access_token"))
        system = get_object_or_404(System, pk=system_id)

        groups = payload.get("groups")
        user_id = payload.get("user_id")

        if not 'admin' in groups:
            if not user_id in [str(user.id) for user in system.dev_team.all()] or system.current_state != "Em desenvolvimento":
                return None
                
        return system.api_key
    
    @staticmethod
    def get_secret_key(request, system_id):
        payload = TokenService.decode_token(request.COOKIES.get("access_token"))
        system = get_object_or_404(System, pk=system_id)

        groups = payload.get("groups")
        user_id = payload.get("user_id")

        if not 'admin' in groups:
            if not user_id in system.dev_team.all() or system.current_state != "Em desenvolvimento":
                return None
                
        return system.secret_key

    @staticmethod
    def extract_instance_fields(instance, field_map: dict, request=None):
        result = {}

        for field, subfields in field_map.items():
            # Caso especial para api_key
            if field == "api_key":
                api_key = URLFieldsParser.get_api_key(request, getattr(instance, "id", None))
                if api_key is not None:
                    result["api_key"] = api_key
                continue  # Não segue fluxo normal

            if field == "secret_key":
                secret_key = URLFieldsParser.get_secret_key(request, getattr(instance, "id", None))
                if secret_key is not None:
                    result["secret_key"] = secret_key
                continue  # Não segue fluxo normal

            if not hasattr(instance, field):
                result[field] = None
                continue

            value = getattr(instance, field)

            # ManyToMany / reverse FK
            if hasattr(value, "all"):
                items = []
                for obj in value.all():
                    if isinstance(subfields, dict):
                        items.append(URLFieldsParser.extract_instance_fields(obj, subfields, request))
                    else:
                        items.append(obj)
                result[field] = items

            # FK / OneToOne
            elif isinstance(subfields, dict):
                result[field] = URLFieldsParser.extract_instance_fields(value, subfields, request) if value else None

            # Campo simples
            else:
                result[field] = value

        return result
    
    @staticmethod
    def parse(request, instance, fields_param: str):
        """
        Função única que o serializer chama.
        Recebe a instância e a string de campos da URL (?fields=id,nome,...).
        """
        fields = [f.strip() for f in fields_param.split(",")]
        field_map = URLFieldsParser.build_field_map(fields)
        return URLFieldsParser.extract_instance_fields(instance, field_map, request)
