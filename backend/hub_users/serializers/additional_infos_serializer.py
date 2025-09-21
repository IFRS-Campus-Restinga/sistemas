from rest_framework import serializers
from ..models import AdditionalInfos
from hub_auth.services.token_service import TokenService
from hub_systems.models import System
from datetime import date
import re
from ..formatters.format_add_info_data import URLFieldsParser

class AccessDeniedException(Exception):
    pass

class AdditionalInfosSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalInfos
        fields = "__all__"

    def _get_request(self):
        request = self.context.get("request")
        if not request:
            raise AccessDeniedException("Request não disponível no contexto.")
        return request

    def _check_access_read(self, instance):
        """
        Dono ou admin podem acessar.
        """
        request = self._get_request()
        access_token = request.COOKIES.get("access_token")
        system_token = request.COOKIES.get("system")

        if access_token:
            payload = TokenService.decode_token(access_token)
            user_id = payload.get("user_id")
            groups = payload.get("groups", [])

            if "admin" not in groups and str(user_id) != str(instance.user.id):
                raise AccessDeniedException("Você não tem permissão para acessar essas informações.")

        elif system_token:
            if not System.objects.filter(api_key=system_token).exists():
                raise AccessDeniedException("Credencial inválida.")

    def _check_access_create(self, validated_data):
        """
        Dono (criando para si mesmo) ou admin podem criar.
        """
        request = self._get_request()
        access_token = request.COOKIES.get("access_token")
        system_token = request.COOKIES.get("system")

        if access_token:
            payload = TokenService.decode_token(access_token)
            user_id = payload.get("user_id")
            groups = payload.get("groups", [])

            # precisa ser admin ou dono
            if "admin" not in groups and str(user_id) != str(validated_data.get("user").id):
                raise AccessDeniedException("Você só pode criar informações para você mesmo.")
            
        elif system_token:
            raise AccessDeniedException("Credencial de sistema não pode criar informações.")

    def _check_access_update(self):
        """
        Apenas admin pode editar.
        """
        request = self._get_request()
        access_token = request.COOKIES.get("access_token")
        system_token = request.COOKIES.get("system")

        if access_token:
            payload = TokenService.decode_token(access_token)
            groups = payload.get("groups", [])
            if "admin" not in groups:
                raise AccessDeniedException("Apenas administradores podem alterar essas informações.")

        elif system_token:
            raise AccessDeniedException("Credencial de sistema não pode editar informações.")

    def validate(self, data):
        user = data.get("user") or getattr(self.instance, "user", None)
        if not user:
            raise serializers.ValidationError("Usuário associado é obrigatório.")

        groups = getattr(user, "groups", [])
        if hasattr(groups, "values_list"):  # caso seja um QuerySet de ManyToMany
            groups = list(groups.values_list("name", flat=True))
        else:
            groups = list(groups)

        # -------- Valida tipo de conta --------
        is_abstract = getattr(user, "is_abstract")
        if is_abstract:
            raise serializers.ValidationError("Contas de Departamento não podem estar vinculadas à informações adicionais")

        # -------- Valida CPF --------
        cpf = data.get("cpf")
        if cpf:
            if not re.fullmatch(r"\d{11}", cpf):
                raise serializers.ValidationError({"cpf": "CPF deve conter 11 dígitos numéricos."})
            if not self._is_valid_cpf(cpf):
                raise serializers.ValidationError({"cpf": "CPF inválido."})

        # -------- Valida Birth Date --------
        birth_date = data.get("birth_date")
        if birth_date:
            today = date.today()
            age = today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )
            if age < 14 or age > 100:
                raise serializers.ValidationError(
                    {"birth_date": "Idade deve estar entre 14 e 100 anos."}
                )

        # -------- Valida Telefone --------
        telephone = data.get("telephone_number")
        if telephone:
            if not re.fullmatch(r"(\+55\d{11}|\(?\d{2}\)?\d{8,9})", telephone):
                raise serializers.ValidationError(
                    {"telephone_number": "Telefone inválido. Use DDD + número."}
                )

        # -------- Valida Registration --------
        registration = data.get("registration")
        if "aluno" in groups or "servidor" in groups:
            if not registration:
                raise serializers.ValidationError({"registration": "Este campo é obrigatório."})

            if "aluno" in groups and len(registration) > 10:
                raise serializers.ValidationError(
                    {"registration": "Registro de aluno deve ter no máximo 10 caracteres."}
                )

            if "servidor" in groups and not re.fullmatch(r"\d{7}", registration):
                raise serializers.ValidationError(
                    {"registration": "Matrícula SIAPE deve conter 7 dígitos."}
                )

        return data

    # -------- Helper: valida CPF --------
    def _is_valid_cpf(self, cpf: str) -> bool:
        """Validação simples de CPF pelo dígito verificador"""
        if cpf == cpf[0] * len(cpf):  # evita CPFs repetidos tipo 11111111111
            return False

        for i in [9, 10]:
            soma = sum(int(cpf[num]) * ((i + 1) - num) for num in range(0, i))
            digito = ((soma * 10) % 11) % 10
            if int(cpf[i]) != digito:
                return False
        return True

    # ---- Overrides DRF ----
    def to_representation(self, instance):
        self._check_access_read(instance)

        request = self.context.get('request')
        fields = request.GET.get("fields", None)

        if not fields:
            raise serializers.ValidationError('O campo fields não pode ser nulo.')

        return URLFieldsParser.parse(instance, fields)

    def create(self, validated_data):
        self._check_access_create(validated_data)

        user = validated_data.get("user")
        request = self.context.get("request")
        if request and user:
            access_token = request.COOKIES.get("access_token")
            if access_token:
                payload = TokenService.decode_token(access_token)
                user_id = payload.get("user_id")
                if str(user_id) == str(user.id):
                    user.first_login = False
                    user.save(update_fields=["first_login"])

        return super().create(validated_data)

    def update(self, instance, validated_data):
        self._check_access_update()
        return super().update(instance, validated_data)
