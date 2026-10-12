import re
from datetime import date

from rest_framework import serializers

from ..models import User, PersonalInfos


class PersonalInfosSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True
    )
    cpf = serializers.CharField(max_length=11)
    birth_date = serializers.DateField()

    def validate(self, data):
        user = data["user"]
        if user.is_abstract:
            raise serializers.ValidationError(
                "Contas de Departamento não podem ter dados pessoais vinculados."
            )

        cpf = data["cpf"]
        if not re.fullmatch(r"\d{11}", cpf):
            raise serializers.ValidationError(
                {"cpf": "CPF deve conter 11 dígitos numéricos."}
            )
        if not self._is_valid_cpf(cpf):
            raise serializers.ValidationError({"cpf": "CPF inválido."})

        birth_date = data["birth_date"]
        existing_infos = PersonalInfos.objects.filter(cpf=cpf).first()
        if existing_infos and existing_infos.birth_date != birth_date:
            raise serializers.ValidationError(
                {"cpf": "Este CPF já está associado a outra data de nascimento."}
            )

        today = date.today()
        age = today.year - birth_date.year - (
            (today.month, today.day) < (birth_date.month, birth_date.day)
        )
        if age < 14 or age > 100:
            raise serializers.ValidationError(
                {"birth_date": "Idade deve estar entre 14 e 100 anos."}
            )

        return data

    @staticmethod
    def _is_valid_cpf(cpf: str) -> bool:
        if cpf == cpf[0] * len(cpf):
            return False

        for i in [9, 10]:
            soma = sum(int(cpf[num]) * ((i + 1) - num) for num in range(0, i))
            digito = ((soma * 10) % 11) % 10
            if int(cpf[i]) != digito:
                return False
        return True
