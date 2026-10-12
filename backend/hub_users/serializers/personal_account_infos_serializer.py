import re
import uuid
from datetime import date

from django.conf import settings
from rest_framework import serializers

from hub_auth.services.token_service import TokenService
from ..formatters.format_personal_account_infos import URLFieldsParser
from ..models import AccountInfos, BindRequest, User, PersonalInfos


class AccessDeniedException(Exception):
    pass


class PersonalAccountInfosData:
    def __init__(self, user):
        self.user = user
        self.personal_infos = user.personal_infos
        self.account_infos = user.account_infos
class PersonalAccountInfosSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    birth_date = serializers.DateField(required=False)
    telephone_number = serializers.CharField(max_length=13)
    registration = serializers.CharField(
        max_length=11, allow_null=True, allow_blank=True, required=False
    )
    cpf = serializers.CharField(max_length=11, required=False)

    def to_internal_value(self, data):
        personal_infos = data.get("personal_infos")
        account_infos = data.get("account_infos")
        if not isinstance(personal_infos, dict) or not isinstance(account_infos, dict):
            raise serializers.ValidationError(
                {
                    "personal_infos": "Este objeto é obrigatório.",
                    "account_infos": "Este objeto é obrigatório.",
                }
            )

        flattened_data = {
            "user": data.get("user"),
            **personal_infos,
            **account_infos,
        }
        return super().to_internal_value(flattened_data)

    def _get_request(self):
        request = self.context.get("request")
        if not request:
            raise AccessDeniedException("Request não disponível no contexto.")
        return request

    def _check_access_read(self, instance):
        request = self._get_request()
        access_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        if not access_token:
            raise AccessDeniedException(
                "É necessário estar autenticado para acessar essas informações."
            )

        payload = TokenService.decode_token(access_token)
        user_id = payload.get("user_id")
        try:
            requester_id = uuid.UUID(str(user_id))
        except (TypeError, ValueError, AttributeError) as error:
            raise AccessDeniedException("Usuário inválido no token.") from error

        requester = User.objects.filter(pk=requester_id).first()
        if not requester:
            raise AccessDeniedException("Usuário inválido no token.")

        is_admin = requester.groups.filter(name="admin").exists()
        has_personal_infos = instance.personal_infos is not None
        has_account_infos = instance.account_infos is not None
        is_linked_to_requested_infos = (
            (has_personal_infos or has_account_infos)
            and (
                not has_personal_infos
                or requester.personal_infos_id == instance.personal_infos.id
            )
            and (
                not has_account_infos
                or requester.account_infos_id == instance.account_infos.id
            )
        )
        if not (is_admin or is_linked_to_requested_infos):
            raise AccessDeniedException(
                "Você não tem permissão para acessar essas informações."
            )

    def _check_access_create(self, validated_data):
        request = self._get_request()
        access_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        system_token = request.COOKIES.get("system")

        if access_token:
            payload = TokenService.decode_token(access_token)
            user_id = payload.get("user_id")
            groups = payload.get("groups", [])

            if "admin" not in groups and str(user_id) != str(validated_data["user"].id):
                raise AccessDeniedException(
                    "Você só pode criar informações para você mesmo."
                )
        elif system_token:
            raise AccessDeniedException("Credencial de sistema não pode criar informações.")

    def _check_access_update(self, instance):
        request = self._get_request()
        access_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
        system_token = request.COOKIES.get("system")

        if access_token:
            payload = TokenService.decode_token(access_token)
            requester_id = payload.get("user_id")
            try:
                requester_id = uuid.UUID(str(requester_id))
            except (TypeError, ValueError, AttributeError) as error:
                raise AccessDeniedException("Usuário inválido no token.") from error

            requester = User.objects.filter(pk=requester_id).first()
            if not requester:
                raise AccessDeniedException("Usuário inválido no token.")

            is_admin = requester.groups.filter(name="admin").exists()
            if not (is_admin or requester.pk == instance.user.pk):
                raise AccessDeniedException(
                    "Você só pode alterar suas próprias informações."
                )
        elif system_token:
            raise AccessDeniedException("Credencial de sistema não pode editar informações.")
        else:
            raise AccessDeniedException(
                "É necessário estar autenticado para alterar essas informações."
            )

    def validate(self, data):
        if self.instance:
            self._check_access_update(self.instance)

        user = data.get("user") or (self.instance.user if self.instance else None)
        if not user:
            raise serializers.ValidationError("Usuário associado é obrigatório.")
        if self.instance and user.pk != self.instance.user.pk:
            raise serializers.ValidationError(
                {"user": "As informações não podem ser transferidas para outro usuário."}
            )

        has_pending_bind_request = BindRequest.objects.filter(user=user).exists()
        if (
            not data.get("cpf")
            or not data.get("birth_date")
        ) and not (
            self.instance
            and self.instance.personal_infos
            or has_pending_bind_request
        ):
            raise serializers.ValidationError(
                {
                    "personal_infos": (
                        "CPF e data de nascimento são obrigatórios quando não há "
                        "solicitação de vínculo pendente."
                    )
                }
            )

        groups = list(user.groups.values_list("name", flat=True))
        if user.is_abstract:
            raise serializers.ValidationError(
                "Contas de Departamento não podem ter dados pessoais e da conta vinculados."
            )

        if user.access_profile == "aluno" and user.is_abstract:
            raise serializers.ValidationError(
                "Usuários do perfil aluno não podem ser do tipo Departamento."
            )

        cpf = data.get("cpf")
        if cpf:
            if not re.fullmatch(r"\d{11}", cpf):
                raise serializers.ValidationError(
                    {"cpf": "CPF deve conter 11 dígitos numéricos."}
                )
            if not self._is_valid_cpf(cpf):
                raise serializers.ValidationError({"cpf": "CPF inválido."})

            existing = PersonalInfos.objects.filter(cpf=cpf)
            if self.instance and self.instance.personal_infos:
                existing = existing.exclude(pk=self.instance.personal_infos.pk)
            existing_infos = existing.first()
            if existing_infos:
                if (
                    not self.instance
                    or existing_infos.birth_date != data.get("birth_date")
                ):
                    raise serializers.ValidationError({"cpf": "CPF já cadastrado."})

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

        telephone = data.get("telephone_number")
        if telephone and not re.fullmatch(r"(\+55\d{11}|\(?\d{2}\)?\d{8,9})", telephone):
            raise serializers.ValidationError(
                {"telephone_number": "Telefone inválido. Use DDD + número."}
            )

        registration = data.get("registration")
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

        if registration:
            existing_registration = AccountInfos.objects.filter(
                registration=registration
            )
            if self.instance and self.instance.account_infos:
                existing_registration = existing_registration.exclude(
                    pk=self.instance.account_infos.pk
                )
            if existing_registration.exists():
                raise serializers.ValidationError(
                    {"registration": "Matrícula já cadastrada."}
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

    def to_representation(self, instance):
        self._check_access_read(instance)

        request = self.context.get("request")
        fields = request.GET.get("fields")
        if not fields:
            raise serializers.ValidationError("O campo fields não pode ser nulo.")

        return URLFieldsParser.parse(instance, fields)

    def create(self, validated_data):
        self._check_access_create(validated_data)

        user = validated_data["user"]
        personal_infos = PersonalInfos.objects.create(
            cpf=validated_data["cpf"],
            birth_date=validated_data["birth_date"],
        )
        account_infos = AccountInfos.objects.create(
            registration=validated_data.get("registration"),
            telephone_number=validated_data["telephone_number"],
        )

        user.personal_infos = personal_infos
        user.account_infos = account_infos
        update_fields = ["personal_infos", "account_infos"]
        if str(self._get_request().COOKIES.get(settings.AUTH_COOKIE_NAME, "")):
            payload = TokenService.decode_token(
                self._get_request().COOKIES[settings.AUTH_COOKIE_NAME]
            )
            if str(payload.get("user_id")) == str(user.id):
                user.first_login = False
                update_fields.append("first_login")
        user.save(update_fields=update_fields)

        return PersonalAccountInfosData(user)

    def update(self, instance, validated_data):
        user = validated_data.get("user", instance.user)

        personal_infos = instance.personal_infos
        if "cpf" in validated_data and "birth_date" in validated_data:
            existing_personal_infos = PersonalInfos.objects.filter(
                cpf=validated_data["cpf"]
            ).first()
            if existing_personal_infos and (
                not personal_infos or existing_personal_infos.pk != personal_infos.pk
            ):
                BindRequest.objects.get_or_create(
                    user=user,
                    personal_infos=existing_personal_infos,
                )
                personal_infos = None
            elif personal_infos:
                personal_infos.cpf = validated_data["cpf"]
                personal_infos.birth_date = validated_data["birth_date"]
                personal_infos.save(update_fields=["cpf", "birth_date"])
            else:
                personal_infos = PersonalInfos.objects.create(
                    cpf=validated_data["cpf"],
                    birth_date=validated_data["birth_date"],
                )

        account_infos = instance.account_infos
        if account_infos:
            account_infos.registration = validated_data.get("registration")
            account_infos.telephone_number = validated_data["telephone_number"]
            account_infos.save(update_fields=["registration", "telephone_number"])
        else:
            account_infos = AccountInfos.objects.create(
                registration=validated_data.get("registration"),
                telephone_number=validated_data["telephone_number"],
            )

        user.personal_infos = personal_infos
        user.account_infos = account_infos
        user.save(update_fields=["personal_infos", "account_infos"])
        return PersonalAccountInfosData(user)
