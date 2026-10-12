import uuid
from django.conf import settings
from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404
from hub_auth.services.token_service import TokenService
from ..models import AccountInfos, BindRequest, User, PersonalInfos
from ..serializers.personal_account_infos_serializer import (
    AccessDeniedException,
    PersonalAccountInfosData,
    PersonalAccountInfosSerializer,
)
from ..serializers.account_infos_serializer import AccountInfosSerializer
from ..serializers.personal_infos_serializer import PersonalInfosSerializer
from rest_framework import serializers


class PersonalAccountInfosService:
    @staticmethod
    def _flatten_payload(data):
        personal_infos = data.get("personal_infos")
        account_infos = data.get("account_infos")
        if not isinstance(personal_infos, dict) or not isinstance(account_infos, dict):
            raise serializers.ValidationError(
                {
                    "personal_infos": "Este objeto é obrigatório.",
                    "account_infos": "Este objeto é obrigatório.",
                }
            )
        return {"user": data.get("user"), **personal_infos, **account_infos}

    @staticmethod
    def create(request):
        payload = PersonalAccountInfosService._flatten_payload(request.data)
        personal_serializer = PersonalInfosSerializer(data=payload)
        account_serializer = AccountInfosSerializer(data=payload)

        personal_is_valid = personal_serializer.is_valid()
        account_is_valid = account_serializer.is_valid()
        if not personal_is_valid or not account_is_valid:
            errors = {
                **personal_serializer.errors,
                **account_serializer.errors,
            }
            raise serializers.ValidationError(errors)

        user = personal_serializer.validated_data["user"]
        if user.pk != account_serializer.validated_data["user"].pk:
            raise serializers.ValidationError(
                {"user": "Os dados pessoais e da conta devem pertencer ao mesmo usuário."}
            )

        access_serializer = PersonalAccountInfosSerializer(
            context={"request": request}
        )
        access_serializer._check_access_create({"user": user})

        personal_data = personal_serializer.validated_data
        account_data = account_serializer.validated_data
        with transaction.atomic():
            (
                personal_infos,
                personal_infos_created,
            ) = PersonalInfos.objects.get_or_create(
                cpf=personal_data["cpf"],
                defaults={"birth_date": personal_data["birth_date"]},
            )
            if personal_infos_created or user.personal_infos_id == personal_infos.pk:
                user.personal_infos = personal_infos
            else:
                BindRequest.objects.get_or_create(
                    user=user,
                    personal_infos=personal_infos,
                )

            registration = account_data.get("registration")
            if registration:
                account_infos, _ = AccountInfos.objects.get_or_create(
                    registration=registration,
                    defaults={
                        "telephone_number": account_data["telephone_number"],
                    },
                )
            else:
                account_infos = AccountInfos.objects.filter(
                    registration__isnull=True,
                    telephone_number=account_data["telephone_number"],
                ).first()
                if account_infos is None:
                    account_infos = AccountInfos.objects.create(
                        registration=None,
                        telephone_number=account_data["telephone_number"],
                    )

            user.account_infos = account_infos
            update_fields = ["account_infos"]
            if user.personal_infos_id:
                update_fields.append("personal_infos")

            access_token = request.COOKIES.get(settings.AUTH_COOKIE_NAME)
            if access_token:
                payload = TokenService.decode_token(access_token)
                if str(payload.get("user_id")) == str(user.id):
                    user.first_login = False
                    update_fields.append("first_login")
            user.save(update_fields=update_fields)

        return PersonalAccountInfosData(user)
    
    @staticmethod
    def get(request, user_id):
        user = get_object_or_404(
            User.objects.select_related('personal_infos', 'account_infos'),
            pk=uuid.UUID(user_id),
        )
        if not user.personal_infos_id and not user.account_infos_id:
            raise Http404

        serializer = PersonalAccountInfosSerializer(
            instance=PersonalAccountInfosData(user), context={'request': request}
        )

        return serializer.data
    
    @staticmethod
    @transaction.atomic
    def edit(request, user_id):
        user = get_object_or_404(
            User.objects.select_related('personal_infos', 'account_infos'),
            pk=uuid.UUID(user_id),
        )
        if not user.personal_infos_id and not user.account_infos_id:
            raise Http404

        serializer = PersonalAccountInfosSerializer(
            instance=PersonalAccountInfosData(user),
            data=request.data,
            context={'request': request},
        )

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
        
        serializer.save()