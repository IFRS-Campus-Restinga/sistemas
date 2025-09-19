import re
import uuid
from rest_framework import serializers
from django.contrib.auth.models import Group
from hub_users.models import CustomUser
from ..formatters.format_user_data import URLFieldsParser


def validateUserGroups(access_profile: str, groups) -> None:
    """
    Regras de validação para perfis e grupos de acesso.
    Levanta ValidationError em caso de conflito.
    """

    # Transformar em lista para poder iterar mais de uma vez
    groups = list(groups)

    # Extrair nomes (ou use uuid se for o identificador oficial)
    group_names = [g.name for g in groups]

    # Regra 1: não pode ter admin junto com user ou guest
    if "admin" in group_names and ("user" in group_names):
        raise serializers.ValidationError(
            "Não é permitido vincular 'admin' e 'user'."
        )

    # Regra 2: se perfil = convidado, não pode ter coord
    if access_profile == "convidado" and "coord" in group_names:
        raise serializers.ValidationError(
            "Usuários com perfil 'convidado' não podem ter o grupo 'coord'."
        )
    
    # Regra 3: se perfil = aluno ou convidado, não pode ser admin
    if "admin" in group_names and (access_profile == 'aluno' or access_profile == 'convidado'):
        raise serializers.ValidationError(
            "Apenas servidores podem possuir perfil admin"
        )


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def validate_email(self, value: str):
        email_regex = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
        if not email_regex.match(value):
            raise serializers.ValidationError("E-mail inválido.")
        return value

    def validate(self, data):
        """
        Valida regras de acesso relacionadas a groups e access_profile.
        """
        access_profile = data.get("access_profile")
        groups = data.get("groups", [])

        if access_profile and groups:
            validateUserGroups(access_profile, groups)

        return data

    def create(self, validated_data):
        """
        Usa get_or_create: se o usuário já existir, retorna ele;
        caso contrário, cria com os dados do payload.
        """
        user, created = CustomUser.objects.get_or_create(
            email=validated_data.get("email"),
            defaults=validated_data
        )
        return user

    def to_representation(self, instance):
        request = self.context.get('request')
        fields = request.GET.get("fields", None)

        if not fields:
            raise serializers.ValidationError('O campo fields não pode ser nulo.')

        return URLFieldsParser.parse(instance, fields)
