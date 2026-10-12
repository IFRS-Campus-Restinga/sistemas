import re

from rest_framework import serializers

from ..models import AccountInfos, User


class AccountInfosSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )
    telephone_number = serializers.CharField(max_length=13)
    registration = serializers.CharField(
        max_length=11, allow_null=True, allow_blank=True, required=False
    )

    def validate(self, data):
        telephone = data["telephone_number"]
        if not re.fullmatch(r"(\+55\d{11}|\(?\d{2}\)?\d{8,9})", telephone):
            raise serializers.ValidationError(
                {"telephone_number": "Telefone inválido. Use DDD + número."}
            )

        registration = data.get("registration")
        existing_infos = AccountInfos.objects.filter(registration=registration).first()
        if (
            registration
            and existing_infos
            and existing_infos.telephone_number != telephone
        ):
            raise serializers.ValidationError(
                {"registration": "Esta matrícula já está associada a outro telefone."}
            )

        groups = set(data["user"].groups.values_list("name", flat=True))
        if "aluno" in groups or "servidor" in groups:
            if not registration:
                raise serializers.ValidationError(
                    {"registration": "Este campo é obrigatório."}
                )
            if "aluno" in groups and len(registration) > 10:
                raise serializers.ValidationError(
                    {"registration": "Registro de aluno deve ter no máximo 10 caracteres."}
                )
            if "servidor" in groups and not re.fullmatch(r"\d{7}", registration):
                raise serializers.ValidationError(
                    {"registration": "Matrícula SIAPE deve conter 7 dígitos."}
                )

        return data
